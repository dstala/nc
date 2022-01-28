import NcTimestamps from './common/NcTimestamps';
import NcOrder from './common/NcOrder';
import NcSoftDelete from './common/NcSoftDelete';

export default interface NcGalleryView
  extends NcTimestamps,
    NcOrder,
    NcSoftDelete {
  id: string;
  project_id: string;
  db_alias: string;
  uuid: string;
  public: string;
  password: string;
  show_all_fields: string;
  tn: string;
  _tn: string;
  cn: string;
  _cn: string;
  next_enabled: boolean;
  prev_enabled: boolean;
  cover_image_idx?: number;
  cover_image: string;
  restrict_types?: string;
  restrict_size?: string;
  restrict_number?: string;
  dimensions?: string;
  responsive_columns?: string;
}
