"use client";

import {
  usePlaylists,
  flattenPlaylistsPages,
  useCreatePlaylist,
  useUpdatePlaylist,
  useDeletePlaylist,
  uploadPlaylistCover,
  type PlaylistsPageResult,
} from "@/hooks/usePlaylists";
import type { Playlist } from "@/types/playlist";
import { useRef, useEffect, useState } from "react";
import {
  Plus,
  MoreVertical,
  Pencil,
  Trash2,
  Loader2,
  Image as ImageIcon,
} from "lucide-react";
import Image from "next/image";

const PER_PAGE = 15;
const DEFAULT_COVER = "/default-cover.jpeg";

/** Resolve playlist cover URL: use as-is if absolute, else prepend media base. */
function getPlaylistCoverUrl(cover: string | undefined): string {
  if (!cover?.trim()) return DEFAULT_COVER;
  if (cover.startsWith("http://") || cover.startsWith("https://")) return cover;
  const base = process.env.NEXT_PUBLIC_MEDIA_URL ?? "";
  return `${base}/${cover}`.replace(/\/+/g, "/");
}

function LoadMoreSentinel({
  onVisible,
  hasNextPage,
  isFetchingNextPage,
}: {
  onVisible: () => void;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!hasNextPage || isFetchingNextPage) return;
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) onVisible();
      },
      { rootMargin: "100px", threshold: 0 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [onVisible, hasNextPage, isFetchingNextPage]);

  if (!hasNextPage) return null;
  return <div ref={ref} className="h-4" aria-hidden />;
}

function PlaylistCard({
  playlist,
  onEdit,
  onDelete,
  isDeleting,
}: {
  playlist: Playlist;
  onEdit: (p: Playlist) => void;
  onDelete: (p: Playlist) => void;
  isDeleting: boolean;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const coverUrl = getPlaylistCoverUrl(playlist.cover);

  return (
    <div className="group flex items-center gap-3 rounded-xl border border-white/5 bg-black/20 py-2.5 pl-2 pr-2 transition hover:bg-white/5">
      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-white/10">
        <Image
          src={coverUrl}
          alt=""
          width={48}
          height={48}
          className="object-cover"
          unoptimized={coverUrl.startsWith("http") || coverUrl !== DEFAULT_COVER}
        />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-white">
          {playlist.title || "Untitled"}
        </p>
      </div>
      <div className="relative shrink-0">
        <button
          type="button"
          onClick={() => setMenuOpen((o) => !o)}
          className="rounded-lg p-2 text-neutral-400 hover:bg-white/10 hover:text-white"
          aria-label="Playlist options"
        >
          <MoreVertical className="h-4 w-4" strokeWidth={2} />
        </button>
        {menuOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              aria-hidden
              onClick={() => setMenuOpen(false)}
            />
            <div className="absolute right-0 top-full z-50 mt-1 min-w-[140px] rounded-lg border border-white/10 bg-black/90 py-1 shadow-xl backdrop-blur-md">
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  onEdit(playlist);
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-white hover:bg-white/10"
              >
                <Pencil className="h-3.5 w-3.5" strokeWidth={2} />
                Edit
              </button>
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  onDelete(playlist);
                }}
                disabled={isDeleting}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-400 hover:bg-white/10 disabled:opacity-50"
              >
                {isDeleting ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Trash2 className="h-3.5 w-3.5" strokeWidth={2} />
                )}
                Delete
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

type CreateStep = "form" | "uploading";

function CreatePlaylistDialog({
  open,
  onClose,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [step, setStep] = useState<CreateStep>("form");
  const [title, setTitle] = useState("");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const createPlaylist = useCreatePlaylist();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverFile(file);
      setCoverPreview(URL.createObjectURL(file));
    } else {
      setCoverFile(null);
      setCoverPreview(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;

    setStep("uploading");
    let coverFilename: string | undefined;
    try {
      if (coverFile) {
        const { filename } = await uploadPlaylistCover(coverFile);
        coverFilename = filename;
      }
      await createPlaylist.mutateAsync({
        title: trimmed,
        ...(coverFilename ? { cover: coverFilename } : {}),
      });
      onSuccess();
      onClose();
      setTitle("");
      setCoverFile(null);
      setCoverPreview(null);
    } catch (err) {
      setStep("form");
      throw err;
    } finally {
      setStep("form");
    }
  };

  const handleClose = () => {
    if (step !== "uploading") {
      setTitle("");
      setCoverFile(null);
      if (coverPreview) URL.revokeObjectURL(coverPreview);
      setCoverPreview(null);
      onClose();
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        aria-hidden
        onClick={handleClose}
      />
      <div className="relative w-full max-w-sm rounded-2xl border border-white/10 bg-black/90 p-5 shadow-2xl">
        <h3 className="mb-4 text-lg font-semibold text-white">
          New playlist
        </h3>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label
              htmlFor="create-playlist-title"
              className="mb-1 block text-xs font-medium text-neutral-400"
            >
              Title
            </label>
            <input
              id="create-playlist-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="My playlist"
              disabled={step === "uploading"}
              className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 px-3 text-sm text-white placeholder-neutral-500 outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 disabled:opacity-60"
              autoFocus
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-neutral-400">
              Cover (optional)
            </label>
            <div className="flex items-center gap-3">
              <label className="flex h-14 w-14 cursor-pointer items-center justify-center overflow-hidden rounded-lg border border-white/10 bg-white/5 hover:bg-white/10">
                <input
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={handleFileChange}
                  disabled={step === "uploading"}
                />
                {coverPreview ? (
                  <img
                    src={coverPreview}
                    alt="Preview"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <ImageIcon className="h-6 w-6 text-neutral-500" />
                )}
              </label>
              <span className="text-xs text-neutral-500">
                {coverFile ? coverFile.name : "Choose image"}
              </span>
            </div>
          </div>
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={step === "uploading"}
              className="flex-1 rounded-xl border border-white/10 py-2.5 text-sm font-medium text-neutral-300 hover:bg-white/5 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!title.trim() || step === "uploading"}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 py-2.5 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-50"
            >
              {step === "uploading" ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating…
                </>
              ) : (
                "Create"
              )}
            </button>
          </div>
        </form>
        {createPlaylist.isError && (
          <p className="mt-2 text-center text-sm text-red-400">
            {createPlaylist.error?.message}
          </p>
        )}
      </div>
    </div>
  );
}

function EditPlaylistDialog({
  playlist,
  open,
  onClose,
  onSuccess,
}: {
  playlist: Playlist | null;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [title, setTitle] = useState(playlist?.title ?? "");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const updatePlaylist = useUpdatePlaylist();

  // Sync local state when the dialog opens with a (possibly different) playlist
  useEffect(() => {
    if (open && playlist) {
      setTitle(playlist.title ?? "");
      setCoverFile(null);
      setCoverPreview((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });
    }
  }, [open, playlist?.id, playlist?.title]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverFile(file);
      setCoverPreview(URL.createObjectURL(file));
    } else {
      setCoverFile(null);
      setCoverPreview(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!playlist) return;
    const trimmed = title.trim();
    if (!trimmed) return;

    setUploading(true);
    try {
      let coverFilename: string | undefined;
      if (coverFile) {
        const { filename } = await uploadPlaylistCover(coverFile);
        coverFilename = filename;
      }
      await updatePlaylist.mutateAsync({
        id: playlist.id,
        title: trimmed,
        ...(coverFilename !== undefined ? { cover: coverFilename } : {}),
      });
      onSuccess();
      onClose();
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    if (!uploading && playlist) {
      setTitle(playlist.title);
      setCoverFile(null);
      if (coverPreview) URL.revokeObjectURL(coverPreview);
      setCoverPreview(null);
      onClose();
    }
  };

  if (!open || !playlist) return null;

  const currentCover = getPlaylistCoverUrl(playlist.cover);
  const displayPreview = coverPreview ?? (coverFile ? null : currentCover) ?? DEFAULT_COVER;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        aria-hidden
        onClick={handleClose}
      />
      <div className="relative w-full max-w-sm rounded-2xl border border-white/10 bg-black/90 p-5 shadow-2xl">
        <h3 className="mb-4 text-lg font-semibold text-white">
          Edit playlist
        </h3>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label
              htmlFor="edit-playlist-title"
              className="mb-1 block text-xs font-medium text-neutral-400"
            >
              Title
            </label>
            <input
              id="edit-playlist-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="My playlist"
              disabled={uploading}
              className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 px-3 text-sm text-white placeholder-neutral-500 outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 disabled:opacity-60"
              autoFocus
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-neutral-400">
              Cover
            </label>
            <div className="flex items-center gap-3">
              <label className="flex h-14 w-14 cursor-pointer items-center justify-center overflow-hidden rounded-lg border border-white/10 bg-white/5 hover:bg-white/10">
                <input
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={handleFileChange}
                  disabled={uploading}
                />
                {displayPreview ? (
                  <img
                    src={displayPreview}
                    alt="Cover"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <ImageIcon className="h-6 w-6 text-neutral-500" />
                )}
              </label>
              <span className="text-xs text-neutral-500">
                {coverFile ? coverFile.name : "Change image"}
              </span>
            </div>
          </div>
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={uploading}
              className="flex-1 rounded-xl border border-white/10 py-2.5 text-sm font-medium text-neutral-300 hover:bg-white/5 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!title.trim() || uploading}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 py-2.5 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-50"
            >
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving…
                </>
              ) : (
                "Save"
              )}
            </button>
          </div>
        </form>
        {updatePlaylist.isError && (
          <p className="mt-2 text-center text-sm text-red-400">
            {updatePlaylist.error?.message}
          </p>
        )}
      </div>
    </div>
  );
}

function DeleteConfirmDialog({
  playlist,
  open,
  onClose,
  onConfirm,
  isDeleting,
}: {
  playlist: Playlist | null;
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
}) {
  if (!open || !playlist) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        aria-hidden
        onClick={onClose}
      />
      <div className="relative w-full max-w-sm rounded-2xl border border-white/10 bg-black/90 p-5 shadow-2xl">
        <h3 className="mb-2 text-lg font-semibold text-white">
          Delete playlist
        </h3>
        <p className="mb-4 text-sm text-neutral-400">
          Delete &quot;{playlist.title || "Untitled"}&quot;? This cannot be
          undone.
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="flex-1 rounded-xl border border-white/10 py-2.5 text-sm font-medium text-neutral-300 hover:bg-white/5 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-600 py-2.5 text-sm font-medium text-white hover:bg-red-500 disabled:opacity-50"
          >
            {isDeleting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Delete"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PlaylistsPage() {
  const [createOpen, setCreateOpen] = useState(false);
  const [editPlaylist, setEditPlaylist] = useState<Playlist | null>(null);
  const [deletePlaylist, setDeletePlaylist] = useState<Playlist | null>(null);

  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = usePlaylists({ perPage: PER_PAGE });

  const deleteMutation = useDeletePlaylist();
  const playlists = flattenPlaylistsPages(
    data as { pages: PlaylistsPageResult[] } | undefined
  );

  const handleDeleteConfirm = () => {
    if (!deletePlaylist) return;
    deleteMutation.mutate(deletePlaylist.id, {
      onSuccess: () => setDeletePlaylist(null),
    });
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3 h-full">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold tracking-tight text-white">
          Playlists
        </h2>
        <button
          type="button"
          onClick={() => setCreateOpen(true)}
          className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-medium text-white hover:bg-emerald-500"
        >
          <Plus className="h-4 w-4" strokeWidth={2} />
          New playlist
        </button>
      </div>

      <div className="min-h-[220px] flex-1 min-w-0 overflow-x-hidden overflow-y-auto rounded-xl border border-white/5 bg-black/30 px-2">
        {isLoading && (
          <div className="flex items-center justify-center py-8 text-sm text-neutral-400">
            Loading…
          </div>
        )}
        {isError && (
          <div className="py-4 text-center text-sm text-red-400">
            {error?.message ?? "Failed to load playlists"}
          </div>
        )}
        {!isLoading && !isError && playlists.length === 0 && (
          <div className="py-8 text-center text-sm text-neutral-400">
            No playlists yet. Create one to get started.
          </div>
        )}
        {!isLoading && !isError && playlists.length > 0 && (
          <div className="space-y-2 py-2">
            {playlists.map((playlist) => (
              <PlaylistCard
                key={playlist.id}
                playlist={playlist}
                onEdit={setEditPlaylist}
                onDelete={setDeletePlaylist}
                isDeleting={
                  deleteMutation.isPending &&
                  deleteMutation.variables === playlist.id
                }
              />
            ))}
            <LoadMoreSentinel
              onVisible={() => fetchNextPage()}
              hasNextPage={!!hasNextPage}
              isFetchingNextPage={isFetchingNextPage}
            />
            {isFetchingNextPage && (
              <div className="py-2 text-center text-[11px] text-neutral-500">
                Loading more…
              </div>
            )}
          </div>
        )}
      </div>

      <CreatePlaylistDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSuccess={() => {}}
      />
      <EditPlaylistDialog
        playlist={editPlaylist}
        open={!!editPlaylist}
        onClose={() => setEditPlaylist(null)}
        onSuccess={() => {}}
      />
      <DeleteConfirmDialog
        playlist={deletePlaylist}
        open={!!deletePlaylist}
        onClose={() => setDeletePlaylist(null)}
        onConfirm={handleDeleteConfirm}
        isDeleting={deleteMutation.isPending}
      />
    </div>
  );
}
