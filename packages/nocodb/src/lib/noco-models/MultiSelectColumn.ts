import Noco from '../../lib/noco/Noco';
import NocoCache from '../noco-cache/NocoCache';
import { CacheGetType, CacheScope, MetaTable } from '../utils/globals';

export default class MultiSelectColumn {
  title: string;
  fk_column_id: string;

  constructor(data: Partial<MultiSelectColumn>) {
    Object.assign(this, data);
  }

  public static async insert(
    data: Partial<MultiSelectColumn>,
    ncMeta = Noco.ncMeta
  ) {
    const { id: selectOptionId } = await ncMeta.metaInsert2(
      null,
      null,
      MetaTable.COL_SELECT_OPTIONS,
      {
        fk_column_id: data.fk_column_id,
        title: data.title
      }
    );

    await NocoCache.appendToList(
      CacheScope.COL_SELECT_OPTION,
      [data.fk_column_id],
      `${CacheScope.COL_SELECT_OPTION}:${selectOptionId}`
    );

    return this.get({ selectOptionId });
  }

  public static async get(
    {
      selectOptionId
    }: {
      selectOptionId: string;
    },
    ncMeta = Noco.ncMeta
  ): Promise<MultiSelectColumn> {
    let data =
      selectOptionId &&
      (await NocoCache.get(
        `${CacheScope.COL_SELECT_OPTION}:${selectOptionId}`,
        CacheGetType.TYPE_OBJECT
      ));
    if (!data) {
      data = await ncMeta.metaGet2(
        null,
        null,
        MetaTable.COL_SELECT_OPTIONS,
        selectOptionId
      );
      await NocoCache.set(
        `${CacheScope.COL_SELECT_OPTION}:${selectOptionId}`,
        data
      );
    }
    return data && new MultiSelectColumn(data);
  }

  public static async read(columnId: string) {
    let options = await NocoCache.getList(CacheScope.COL_SELECT_OPTION, [
      columnId
    ]);
    if (!options.length) {
      options = await Noco.ncMeta.metaList2(
        null, //,
        null, //model.db_alias,
        MetaTable.COL_SELECT_OPTIONS,
        { condition: { fk_column_id: columnId } }
      );
      await NocoCache.setList(
        CacheScope.COL_SELECT_OPTION,
        [columnId],
        options
      );
    }

    return options?.length
      ? {
          options: options.map(c => new MultiSelectColumn(c))
        }
      : null;
  }

  id: string;
}
