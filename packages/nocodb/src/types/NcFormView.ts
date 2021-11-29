import NcTimestamps from './common/NcTimestamps';
import NcOrder from './common/NcOrder';
import NcSoftDelete from './common/NcSoftDelete';

export default interface NcFormView
  extends NcTimestamps,
    NcOrder,
    NcSoftDelete {
  id: string;
  project_id: string;
  db_alias: string;
  heading: string;
  subheading: string;
  success_msg: string;
  redirect_url: string;
  redirect_after_secs: string;
  email: string;
  submit_another_form: string;
  uuid: string;
  banner_image_url: string;
  public: string;
  password: string;
  show_all_fields: string;
  logo_url: string;
}
