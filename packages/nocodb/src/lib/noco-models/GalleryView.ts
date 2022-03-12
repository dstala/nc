import Noco from '../noco/Noco';
import { CacheGetType, CacheScope, MetaTable } from '../utils/globals';
import { GalleryColumnType, GalleryType } from 'nc-common';
import View from './View';
import UITypes from '../sqlUi/UITypes';
import NocoCache from '../noco-cache/NocoCache';

export default class GalleryView implements GalleryType {
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
  columns?: GalleryColumnType[];
  fk_model_id?: string;
  fk_cover_image_col_id?: string;

  project_id?: string;
  base_id?: string;

  constructor(data: GalleryView) {
    Object.assign(this, data);
  }

  public static async get(viewId: string, ncMeta = Noco.ncMeta) {
    let view =
      viewId &&
      (await NocoCache.get(
        `${CacheScope.GALLERY_VIEW}:${viewId}`,
        CacheGetType.TYPE_OBJECT
      ));
    if (!view) {
      view = await ncMeta.metaGet2(null, null, MetaTable.GALLERY_VIEW, {
        fk_view_id: viewId
      });
      await NocoCache.set(`${CacheScope.GALLERY_VIEW}:${viewId}`, view);
    }

    return view && new GalleryView(view);
  }

  static async insert(view: Partial<GalleryView>, ncMeta = Noco.ncMeta) {
    const columns = await View.get(view.fk_view_id, ncMeta)
      .then(v => v?.getModel(ncMeta))
      .then(m => m.getColumns(ncMeta));

    const insertObj = {
      project_id: view.project_id,
      base_id: view.base_id,
      fk_view_id: view.fk_view_id,
      fk_cover_image_col_id: columns?.find(c => c.uidt === UITypes.Attachment)
        ?.id
    };
    if (!(view.project_id && view.base_id)) {
      const viewRef = await View.get(view.fk_view_id);
      insertObj.project_id = viewRef.project_id;
      insertObj.base_id = viewRef.base_id;
    }

    await ncMeta.metaInsert2(
      null,
      null,
      MetaTable.GALLERY_VIEW,
      insertObj,
      true
    );

    return this.get(view.fk_view_id, ncMeta);
  }

  static async update(
    galleryId: string,
    body: Partial<GalleryView>,
    ncMeta = Noco.ncMeta
  ) {
    // get existing cache
    const key = `${CacheScope.GALLERY_VIEW}:${galleryId}`;
    const o = await NocoCache.get(key, CacheGetType.TYPE_OBJECT);
    if (o) {
      o.title = body.title;
      o.next_enabled = body.next_enabled;
      o.prev_enabled = body.prev_enabled;
      o.cover_image_idx = body.cover_image_idx;
      o.cover_image = body.cover_image;
      o.restrict_types = body.restrict_types;
      o.restrict_size = body.restrict_size;
      o.restrict_number = body.restrict_number;
      o.columns = body.columns;
      o.fk_model_id = body.fk_model_id;
      o.fk_cover_image_col_id = body.fk_cover_image_col_id;
      // set cache
      await NocoCache.set(key, o);
    }
    // update meta
    return await ncMeta.metaUpdate(
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
