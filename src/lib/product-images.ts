import uploadedImages from "./product-image-copies.json";

// Keep local copies of these original uploads so rendering does not depend on
// the remote image optimizer being able to reach the storage host.
const remoteImageBase = "https://kqow28j2jyecfy9y.public.blob.vercel-storage.com/products/";
const localImageFiles = [
  "1780757997419-IMG_4053.jpeg",
  "1780758075299-IMG_4054.jpeg",
  "1780758168112-IMG_4055.jpeg",
  "1780758262525-IMG_4056.jpeg",
  "1780758542447-IMG_4058.jpeg",
];

const localImages = new Map(
  [...Object.entries(uploadedImages), ...localImageFiles.map((filename): [string, string] => [
    `${remoteImageBase}${filename}`,
    `/products/remotes/${filename}`,
  ])],
);

export function resolveProductImage(source: string): string {
  return localImages.get(source) ?? source;
}
