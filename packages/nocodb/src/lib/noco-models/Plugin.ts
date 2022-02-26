import { PluginType } from 'nc-common';
import { MetaTable } from '../utils/globals';
import Noco from '../noco/Noco';

export default class Plugin implements PluginType {
  id?: string;
  title?: string;
  description?: string;
  active?: boolean;
  rating?: number;
  version?: string;
  docs?: string;
  status?: string;
  status_details?: string;
  logo?: string;
  icon?: string;
  tags?: string;
  category?: string;
  input_schema?: string;
  input?: string;
  creator?: string;
  creator_website?: string;
  price?: string;

  constructor(audit: Partial<PluginType>) {
    Object.assign(this, audit);
  }

  public static async get(pluginId: string, ncMeta = Noco.ncMeta) {
    const audit = await ncMeta.metaGet2(null, null, MetaTable.PLUGIN, pluginId);
    return audit && new Plugin(audit);
  }

  static async list(ncMeta = Noco.ncMeta) {
    return await ncMeta.metaList2(null, null, MetaTable.PLUGIN);
  }
  static async count(ncMeta = Noco.ncMeta): Promise<number> {
    return (await ncMeta.knex(MetaTable.PLUGIN).count('id', { as: 'count' }))
      ?.count;
  }

  public static async update(pluginId: string, plugin: Partial<PluginType>) {
    await Noco.ncMeta.metaUpdate(
      null,
      null,
      MetaTable.PLUGIN,
      {
        input:
          plugin.input && typeof plugin.input === 'object'
            ? JSON.stringify(plugin.input)
            : plugin.input,
        active: plugin.active
      },
      pluginId
    );

    return this.get(pluginId);
  }
}