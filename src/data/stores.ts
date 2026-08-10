import { mockStories, type MockStory } from "./mockStories";
import { mockEvents, type MockEvent } from "./mockEvents";
import { mockAlbums, type MockAlbum, type MockPhoto } from "./mockGallery";

let stories = [...mockStories];
let events = [...mockEvents];
let albums = mockAlbums.map((album) => ({ ...album, photos: [...album.photos] }));

export function listStories() {
  return stories;
}
export function getStory(id: string) {
  return stories.find((s) => s.id === id);
}
export function saveStory(story: MockStory) {
  const index = stories.findIndex((s) => s.id === story.id);
  if (index >= 0) stories[index] = story;
  else stories = [story, ...stories];
}
export function removeStory(id: string) {
  stories = stories.filter((s) => s.id !== id);
}

export function listEvents() {
  return events;
}
export function getEvent(id: string) {
  return events.find((e) => e.id === id);
}
export function saveEvent(event: MockEvent) {
  const index = events.findIndex((e) => e.id === event.id);
  if (index >= 0) events[index] = event;
  else events = [event, ...events];
}
export function removeEvent(id: string) {
  events = events.filter((e) => e.id !== id);
}

export function listAlbums() {
  return albums;
}
export function getAlbum(id: string) {
  return albums.find((a) => a.id === id);
}
export function saveAlbum(album: MockAlbum) {
  const index = albums.findIndex((a) => a.id === album.id);
  if (index >= 0) albums[index] = album;
  else albums = [album, ...albums];
}
export function removeAlbum(id: string) {
  albums = albums.filter((a) => a.id !== id);
}
export function addPhoto(albumId: string, photo: MockPhoto) {
  albums = albums.map((album) => (album.id === albumId ? { ...album, photos: [...album.photos, photo] } : album));
}
export function removePhoto(albumId: string, photoId: string) {
  albums = albums.map((album) =>
    album.id === albumId ? { ...album, photos: album.photos.filter((p) => p.id !== photoId) } : album
  );
}
