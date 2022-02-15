import Noco from '../noco/Noco';
import { MetaTable } from '../utils/globals';
import { Gallery, GalleryColumn } from 'nc-common';
import View from './View';
import UITypes from '../sqlUi/UITypes';

export default class GalleryView implements Gallery {
  fk_view_id?: string;
  title?: string;
  deleted?: boolean;
  order?: number;
  next_enabled?: boolean;
  prev_enabled?: boolean;
  cover_image_idx?: number;
  cover_image?: string;
  restrict_types?: string;
  restrict_size?: string;
  restrict_number?: string;
  public?: boolean;
  password?: string;
  show_all_fields?: boolean;
  columns?: GalleryColumn[];
  fk_model_id?: string;
  fk_cover_image_col_id?: string;

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

  static async insert(view: Partial<GalleryView>) {
    const columns = await View.get(view.fk_view_id)
      .then(v => v?.getModel())
      .then(m => m.getColumns());

    await Noco.ncMeta.metaInsert2(
      null,
      null,
      MetaTable.GALLERY_VIEW,
      {
        fk_view_id: view.fk_view_id,
        fk_cover_image_col_id: columns?.find(c => c.uidt === UITypes.Attachment)
          ?.id
      },
      true
    );

    return this.get(view.fk_view_id);
  }

  static async update(galleryId: string, body: Partial<GalleryView>) {
    return await Noco.ncMeta.metaUpdate(
      null,
      null,
      MetaTable.GALLERY_VIEW,
      {
        title: body.title,
        next_enabled: body.next_enabled,
        prev_enabled: body.prev_enabled,
        cover_image_idx: body.cover_image_idx,
        cover_image: body.cover_image,
        restrict_types: body.restrict_types,
        restrict_size: body.restrict_size,
        restrict_number: body.restrict_number,
        columns: body.columns,
        fk_model_id: body.fk_model_id,
        fk_cover_image_col_id: body.fk_cover_image_col_id
      },
      {
        fk_view_id: galleryId
      }
    );
  }
}
