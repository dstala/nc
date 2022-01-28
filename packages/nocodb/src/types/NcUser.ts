import NcTimestamps from './common/NcTimestamps';
import NcOrder from './common/NcOrder';
import NcSoftDelete from './common/NcSoftDelete';

export default interface NcUser extends NcTimestamps, NcOrder, NcSoftDelete {
  id: string;
  email: string;
  password: string;
  salt: string;
  firstname?: string;
  lastname?: string;
  username: string;
  refresh_token?: string;
  invite_token?: string;
  invite_token_expires?: number | Date;
  reset_password_expires?: number | Date;
  reset_password_token?: string;
  email_verification_token?: string;
  email_verified: boolean;
  roles: string;
  is_owner: boolean;
  last_logged_in_at: Date | number;
}
