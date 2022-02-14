import Noco from '../noco/Noco';
import { MetaTable } from '../utils/globals';

export default class FormView {
  title: string;
  show: boolean;
  is_default: boolean;
  order: number;

  fk_view_id: string;

  constructor(data: FormView) {
    Object.assign(this, data);
  }

  public static async get(viewId: string) {
    const view = await Noco.ncMeta.metaGet2(null, null, MetaTable.FORM_VIEW, {
      fk_view_id: viewId
    });

    return view && new FormView(view);
  }

  static async insert(view: Partial<FormView>) {
    await Noco.ncMeta.metaInsert2(
      null,
      null,
      MetaTable.FORM_VIEW,
      {
        fk_view_id: view.fk_view_id
      },
      true
    );

    return this.get(view.fk_view_id);
  }
}
