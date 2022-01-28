import NcTimestamps from './common/NcTimestamps';
import NcOrder from './common/NcOrder';
import NcSoftDelete from './common/NcSoftDelete';

export default interface NcTeam extends NcTimestamps, NcOrder, NcSoftDelete {
  id: string;
  title: string;
  description: string;
  orgs_id: string;
}
