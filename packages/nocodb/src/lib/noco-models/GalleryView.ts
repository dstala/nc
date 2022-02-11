import Noco from '../noco/Noco';
import { MetaTable } from '../utils/globals';

export default class GalleryView {
  title: string;
  show: boolean;
  is_default: boolean;
  order: number;

  fk_view_id: string;

  constructor(data: GalleryView) {
    Object.assign(this, data);
  }

  public static async get(viewId: string) {
    const view = await Noco.ncMeta.metaGet2(
      null,
      null,
      MetaTable.GALLERY_VIEW,
      {
        fk_view_id: viewId
      }
    );

    return view && new GalleryView(view);
  }
}
