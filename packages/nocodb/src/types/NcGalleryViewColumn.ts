import NcTimestamps from './common/NcTimestamps';
import NcOrder from './common/NcOrder';
import NcSoftDelete from './common/NcSoftDelete';

export default interface NcGalleryViewColumn
  extends NcTimestamps,
    NcOrder,
    NcSoftDelete {
  id: string;
  project_id: string;
  db_alias: string;
  uuid: string;
  tn: string;
  _tn: string;
  cn: string;
  _cn: string;
  label: string;
  help?: string;
}
