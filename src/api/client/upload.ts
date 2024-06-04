import { assignBaseUrl, sendPost } from '../axios';

export const uploadFile = (file: File) => {
  const formData = new FormData();
  formData.append('files', file);
  return sendPost(assignBaseUrl('app/upload-file'), formData);
};
