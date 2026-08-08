import { useState } from "react";
import { matchPath, navigateTo } from "../../routing/navigate";
import { addPhoto, getAlbum, listAlbums, removeAlbum, removePhoto, saveAlbum } from "../../data/stores";
import type { MockAlbum } from "../../data/mockGallery";
import { canEdit } from "../../auth/permissions";
import { EmptyState } from "../../components/ui/PageStates";

interface GalleryPageProps {
  pathname: string;
}

export function GalleryPage({ pathname }: GalleryPageProps) {
  const [, setTick] = useState(0);
  const refresh = () => setTick((n) => n + 1);
  const albumMatch = matchPath("/gallery/:albumId", pathname);
  const photoMatch = matchPath("/gallery/:albumId/photo/:photoId", pathname);
  const [creating, setCreating] = useState(false);
  const [title, setTitle] = useState("");
  const [viewer, setViewer] = useState<string | null>(photoMatch?.params.photoId ?? null);

  if (albumMatch || photoMatch) {
    const albumId = (photoMatch ?? albumMatch)!.params.albumId;
    const album = getAlbum(albumId);
    if (!album) return <EmptyState title="Album not found" message="This album is no longer available." />;
    const activePhoto = viewer ? album.photos.find((p) => p.id === viewer) : null;

    return (
      <div className="mx-auto max-w-5xl space-y-4 p-4 md:p-6">
        <div className="flex items-center justify-between">
          <div>
            <button type="button" onClick={() => navigateTo("/gallery")} className="text-xs text-emerald-400">
              ← Albums
            </button>
            <h2 className="text-xl font-semibold">{album.title}</h2>
            <p className="text-sm text-slate-400">{album.description}</p>
          </div>
          {canEdit() && (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  addPhoto(album.id, {
                    id: `p-${Date.now()}`,
                    url: "https://images.unsplash.com/photo-1511895426328-dc8714191300?w=1200&h=800&fit=crop",
                    caption: "New family photo",
                    takenOn: new Date().toISOString().slice(0, 10),
                    relatedMemberIds: []
                  });
                  refresh();
                }}
                className="rounded-xl bg-emerald-500 px-3 py-2 text-sm font-semibold text-slate-950"
              >
                Upload photo
              </button>
              <button
                type="button"
                onClick={() => {
                  removeAlbum(album.id);
                  navigateTo("/gallery");
                }}
                className="rounded-xl border border-rose-500/40 px-3 py-2 text-sm text-rose-300"
              >
                Delete album
              </button>
            </div>
          )}
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {album.photos.map((photo) => (
            <button
              key={photo.id}
              type="button"
              onClick={() => {
                setViewer(photo.id);
                navigateTo(`/gallery/${album.id}/photo/${photo.id}`);
              }}
              className="overflow-hidden rounded-xl border border-slate-800"
            >
              <img src={photo.url} alt="" className="h-36 w-full object-cover" />
            </button>
          ))}
        </div>

        {activePhoto && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4">
            <div className="max-w-3xl rounded-2xl border border-slate-800 bg-slate-950 p-4">
              <img src={activePhoto.url} alt="" className="max-h-[70vh] w-full rounded-xl object-contain" />
              <p className="mt-3 text-sm text-slate-300">{activePhoto.caption}</p>
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setViewer(null);
                    navigateTo(`/gallery/${album.id}`);
                  }}
                  className="rounded-xl border border-slate-700 px-3 py-2 text-sm"
                >
                  Close
                </button>
                {canEdit() && (
                  <button
                    type="button"
                    onClick={() => {
                      removePhoto(album.id, activePhoto.id);
                      setViewer(null);
                      navigateTo(`/gallery/${album.id}`);
                      refresh();
                    }}
                    className="rounded-xl border border-rose-500/40 px-3 py-2 text-sm text-rose-300"
                  >
                    Delete photo
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  const albums = listAlbums();

  return (
    <div className="mx-auto max-w-5xl space-y-4 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-400">{albums.length} albums</p>
        {canEdit() && (
          <button type="button" onClick={() => setCreating(true)} className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950">
            Create album
          </button>
        )}
      </div>
      {creating && (
        <form
          className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4"
          onSubmit={(e) => {
            e.preventDefault();
            const album: MockAlbum = {
              id: `album-${Date.now()}`,
              title: title || "Untitled album",
              description: "A new family album.",
              coverUrl: "https://images.unsplash.com/photo-1511895426328-dc8714191300?w=900&h=600&fit=crop",
              createdOn: new Date().toISOString().slice(0, 10),
              photos: []
            };
            saveAlbum(album);
            setTitle("");
            setCreating(false);
            navigateTo(`/gallery/${album.id}`);
          }}
        >
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Album title"
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none focus:border-emerald-500"
          />
          <div className="mt-3 flex gap-2">
            <button type="submit" className="rounded-xl bg-emerald-500 px-3 py-2 text-sm font-semibold text-slate-950">
              Save
            </button>
            <button type="button" onClick={() => setCreating(false)} className="rounded-xl border border-slate-700 px-3 py-2 text-sm">
              Cancel
            </button>
          </div>
        </form>
      )}
      {albums.length === 0 ? (
        <EmptyState title="No albums yet" message="Create an album to start collecting family photos." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {albums.map((album) => (
            <button
              key={album.id}
              type="button"
              onClick={() => navigateTo(`/gallery/${album.id}`)}
              className="overflow-hidden rounded-2xl border border-slate-800 text-left hover:border-emerald-500/40"
            >
              <img src={album.coverUrl} alt="" className="h-40 w-full object-cover" />
              <div className="p-4">
                <h3 className="font-semibold">{album.title}</h3>
                <p className="mt-1 text-sm text-slate-400">{album.photos.length} photos</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
