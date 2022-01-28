/**
 * Column List
 *
 *
 */
import NcTimestamps from '../common/NcTimestamps';
import NcSoftDelete from '../common/NcSoftDelete';
import NcOrder from '../common/NcOrder';

export default interface NcModel extends NcTimestamps, NcOrder, NcSoftDelete {
  id: string;
  title: string;
  alias: string;
  project_id: string;
  db_alias: 'db' | string;
  type: 'table' | 'view' | 'grid' | 'form' | 'kanban' | 'calendar' | 'gantt';
  schema: any;
  enabled: boolean;
  parent_id?: string;
  order: number;
  tags?: string;
  pin: boolean;
  // mm;
  // m2m_meta;
  copy_enabled?: boolean;
  export_enabled?: boolean;

  password?: string;
  uuid?: string;
  show_all_fields?: boolean;
}
