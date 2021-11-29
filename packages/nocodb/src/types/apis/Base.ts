import NcTimestamps from './common/NcTimestamps';
import NcOrder from './common/NcOrder';
import NcSoftDelete from './common/NcSoftDelete';

export default interface NcBase extends NcTimestamps, NcOrder, NcSoftDelete {
  id: string;
  title: string;
  description?: string;
  status: 'started' | 'stopped' | string;
  meta?: any;
  color?: string;
}
