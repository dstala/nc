import NcTimestamps from '../common/NcTimestamps';
import NcSoftDelete from '../common/NcSoftDelete';
import NcOrder from '../common/NcOrder';

export default interface NcBase extends NcTimestamps, NcOrder, NcSoftDelete {
  id: string;
  title: string;
  description?: string;
  status: 'started' | 'stopped' | string;
  meta?: any;
  color?: string;
}
