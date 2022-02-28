import { Request, Response, Router } from 'express';
import Model from '../../../noco-models/Model';
import { nocoExecute } from '../../noco-resolver/NocoExecute';
import Base from '../../../noco-models/Base';
import NcConnectionMgrv2 from '../../common/NcConnectionMgrv2';
import { PagedResponseImpl } from './helpers/PagedResponse';
import View from '../../../noco-models/View';
import catchError from './helpers/catchError';
import multer from 'multer';
import { ErrorMessages, UITypes, ViewTypes } from 'nc-common';
import Column from '../../../noco-models/Column';
import LinkToAnotherRecordColumn from '../../../noco-models/LinkToAnotherRecordColumn';
import ncMetaAclMw from './helpers/ncMetaAclMw';

export async function dataList(req: Request, res: Response, next) {
  try {
    const view = await View.getByUUID(req.params.publicDataUuid);

    if (!view) return next(new Error('Not found'));
    if (view.type !== ViewTypes.GRID) return next(new Error('Not found'));

    if (view.password && view.password !== req.body?.password) {
      return res.status(401).json(ErrorMessages.INVALID_SHARED_VIEW_PASSWORD);
    }

    const model = await Model.getByIdOrName({
      id: view?.fk_model_id
    });

    console.timeEnd('Model.get');
    const base = await Base.get(model.base_id);
    console.time('BaseModel.get');
    const baseModel = await Model.getBaseModelSQL({
      id: model.id,
      viewId: view?.id,
      dbDriver: NcConnectionMgrv2.get(base)
    });

    console.timeEnd('BaseModel.get');

    console.time('BaseModel.defaultResolverReq');
    const key = `${model._tn}List`;
    const requestObj = {
      [key]: await baseModel.defaultResolverReq(req.query)
    };
    console.timeEnd('BaseModel.defaultResolverReq');

    console.time('nocoExecute');
    const data = (
      await nocoExecute(
        requestObj,
        {
          [key]: async args => {
            return await baseModel.list(args);
          }
        },
        {},
        { ...req.query, sortArr: req.body?.sorts, filterArr: req.body?.filters }
      )
    )?.[key];

    const count = await baseModel.count(req.query);

    console.timeEnd('nocoExecute');

    res.json({
      data: new PagedResponseImpl(data, {
        // todo:
        totalRows: count,
        pageSize: 25,
        page: 1
      })
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({ msg: e.message });
  }
}

async function dataInsert(
  req: Request & { files: any[] },
  res: Response,
  next
) {
  // try {
  //   const model = await Model.get({
  //     id: req.params.viewId
  //   });
  //   if (!model) return next(new Error('Table not found'));
  //
  //   console.timeEnd('Model.get');
  //   const base = await Base.get(model.base_id);
  //   console.time('BaseModel.get');
  //   const baseModel = await Model.getBaseModelSQL({
  //     id: model.id,
  //     dbDriver: NcConnectionMgrv2.get(base)
  //   });
  //
  //   console.timeEnd('BaseModel.get');
  //   res.json(await baseModel.insert(req.body));
  // } catch (e) {
  //   console.log(e);
  //   res.status(500).json({ msg: e.message });
  // }

  const view = await View.getByUUID(req.params.publicDataUuid);

  if (!view) return next(new Error('Not found'));
  if (view.type !== ViewTypes.FORM) return next(new Error('Not found'));

  if (view.password && view.password !== req.body?.password) {
    return res.status(401).json(ErrorMessages.INVALID_SHARED_VIEW_PASSWORD);
  }

  const model = await Model.getByIdOrName({
    id: view?.fk_model_id
  });
  const base = await Base.get(model.base_id);

  const baseModel = await Model.getBaseModelSQL({
    id: model.id,
    viewId: view?.id,
    dbDriver: NcConnectionMgrv2.get(base)
  });
  // if (
  //   sharedViewMeta &&
  //   sharedViewMeta.password &&
  //   sharedViewMeta.password !== args.args.password
  // ) {
  //   throw new Error(this.INVALID_PASSWORD_ERROR);
  // }

  await view.getViewWithInfo();
  await view.getColumns();
  await view.getModelWithInfo();
  await view.model.getColumns();

  const fields = (view.model.columns = view.columns
    .filter(c => c.show)
    .reduce((o, c) => {
      o[view.model.columnsById[c.fk_column_id]._cn] = new Column({
        ...c,
        ...view.model.columnsById[c.fk_column_id]
      } as any);
      return o;
    }, {}) as any);

  const insertObject = Object.entries(req.body).reduce((obj, [key, val]) => {
    if (key in fields) {
      obj[key] = val;
    }
    return obj;
  }, {});
  //
  // for (const [key, obj] of Object.entries(args.args.nested)) {
  //   if (fields.includes(key)) {
  //     insertObject[key] = obj;
  //   }
  // }

  const attachments = {};
  for (const file of req.files || []) {
    if (
      file?.fieldname in fields &&
      fields[file.fieldname].uidt === UITypes.Attachment
    ) {
      attachments[file.fieldname] = attachments[file.fieldname] || [];
      attachments[file.fieldname].push(
        await this._uploadFile({
          file,
          storeInPublicFolder: true,
          req
        })
      );
    }
  }

  for (const [column, data] of Object.entries(attachments)) {
    insertObject[column] = JSON.stringify(data);
  }

  res.json(await baseModel.nestedInsert(insertObject, null));
}

async function relDataList(req, res, next) {
  const view = await View.getByUUID(req.params.publicDataUuid);

  if (!view) return next(new Error('Not found'));
  if (view.type !== ViewTypes.FORM) return next(new Error('Not found'));

  if (view.password && view.password !== req.body?.password) {
    return res.status(401).json(ErrorMessages.INVALID_SHARED_VIEW_PASSWORD);
  }

  const column = await Column.get({ colId: req.params.tableId });
  const colOptions = await column.getColOptions<LinkToAnotherRecordColumn>();

  const model = await colOptions.getRelatedTable();

  // todo: add password support
  // if (
  //   sharedViewMeta &&
  //   sharedViewMeta.password &&
  //   sharedViewMeta.password !== args.args.password
  // ) {
  //   throw new Error(this.INVALID_PASSWORD_ERROR);
  // }

  // const model = apiBuilder.xcModels?.[tn];
  //
  // const primaryCol = apiBuilder?.getMeta(tn)?.columns?.find(c => c.pv)?.cn;

  // const commonParams =
  //   primaryCol && args.args.query
  //     ? {
  //         condition: {
  //           [primaryCol]: {
  //             like: `%${args.args.query}%`
  //           }
  //         }
  //       }
  //     : {};

  console.timeEnd('Model.get');
  const base = await Base.get(model.base_id);
  console.time('BaseModel.get');
  const baseModel = await Model.getBaseModelSQL({
    id: model.id,
    viewId: view?.id,
    dbDriver: NcConnectionMgrv2.get(base)
  });

  console.timeEnd('BaseModel.get');

  console.time('BaseModel.defaultResolverReq');
  const key = `${model._tn}List`;
  const requestObj = {
    [key]: await baseModel.defaultResolverReq(req.query, true)
  };
  console.timeEnd('BaseModel.defaultResolverReq');

  console.time('nocoExecute');
  const data = (
    await nocoExecute(
      requestObj,
      {
        [key]: async args => {
          return await baseModel.list(args);
        }
      },
      {},
      req.query
    )
  )?.[key];

  const count = await baseModel.count(req.query);

  console.timeEnd('nocoExecute');

  res.json({
    data: new PagedResponseImpl(data, {
      // todo:
      totalRows: count,
      pageSize: 25,
      page: 1
    })
  });
}

const router = Router({ mergeParams: true });
router.post('/list', ncMetaAclMw(dataList));
router.post('/relationTable/:tableId', ncMetaAclMw(relDataList));
router.post(
  '/create',
  multer({
    storage: multer.diskStorage({})
  }).any(),
  catchError(dataInsert)
);
export default router;
