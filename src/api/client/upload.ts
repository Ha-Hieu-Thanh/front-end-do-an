import { assignBaseUrlClient, sendPost } from '../axios';

export const uploadFile = (file: File) => {
  const formData = new FormData();
  formData.append('files', file);
  return sendPost(assignBaseUrlClient('app/upload-file'), formData);
};
