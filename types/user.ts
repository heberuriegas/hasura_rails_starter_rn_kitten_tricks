import { Attachment } from './attachment';

export interface User {
  id: number;
  name?: string;
  email?: string;
  username?: string;
  phoneNumber: string;
  avatar?: Attachment;
  createdAt: string;
  updatedAt: string;
}
