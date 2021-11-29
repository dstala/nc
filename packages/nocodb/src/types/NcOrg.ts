import NcTimestamps from './common/NcTimestamps';
import NcOrder from './common/NcOrder';
import NcSoftDelete from './common/NcSoftDelete';

export default interface NcOrg extends NcTimestamps, NcOrder, NcSoftDelete {
  id: string;
  title: string;
  website: string;
  logo_url: string;
}
