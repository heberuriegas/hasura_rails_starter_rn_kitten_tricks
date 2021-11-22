interface Blob {
  id: number;
  key: string;
  filename: string;
  contentType: string;
  byteSize: number;
  checksum: string;
  createdAt: string;
}

export interface Attachment {
  id: number;
  url: string;
  thumbnailUrl: string;
  blob: Blob;
  createdAt: string;
  updatedAt: string;
}
