import { Request, Response, Router } from 'express';
import Model from '../../../noco-models/Model';
import { nocoExecute } from 'nc-help';
import Base from '../../../noco-models/Base';
import NcConnectionMgrv2 from '../../common/NcConnectionMgrv2';
import { PagedResponseImpl } from './helpers/PagedResponse';
import View from '../../../noco-models/View';
import catchError, { NcError } from './helpers/catchError';
import multer from 'multer';
import { ErrorMessages, UITypes, ViewTypes } from 'nc-common';
import Column from '../../../noco-models/Column';
import LinkToAnotherRecordColumn from '../../../noco-models/LinkToAnotherRecordColumn';

export async function dataList(req: Request, res: Response) {
  try {
    const view = await View.getByUUID(req.params.publicDataUuid);

    if (!view) NcError.notFound('Not found');
    if (view.type !== ViewTypes.GRID) NcError.notFound('Not found');

    if (view.password && view.password !== req.body?.password) {
      return NcError.forbidden(ErrorMessages.INVALID_SHARED_VIEW_PASSWORD);
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

    const key = `${model._tn}List`;
    const requestObj = {
      [key]: await baseModel.defaultResolverReq(req.query)
    };

    const data = (
      await nocoExecute(
        requestObj,
        {
          [key]: async args => {
            return await baseModel.list(args);
          }
        },
        {},

        {
          nested: {
            [key]: {
              ...req.query,
              sortArr: req.body?.sorts,
              filterArr: req.body?.filters
            }
          }
        }
      )
    )?.[key];

    const count = await baseModel.count({
      ...req.query,
      filterArr: req.body?.filters
    });

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
  //
  //   const base = await Base.get(model.base_id);
  //
  //   const baseModel = await Model.getBaseModelSQL({
  //     id: model.id,
  //     dbDriver: NcConnectionMgrv2.get(base)
  //   });
  //
  //
  //   res.json(await baseModel.insert(req.body));
  // } catch (e) {
  //   console.log(e);
  //   res.status(500).json({ msg: e.message });
  // }

  const view = await View.getByUUID(req.params.publicDataUuid);

  if (!view) return next(new Error('Not found'));
  if (view.type !== ViewTypes.FORM) return next(new Error('Not found'));

  if (view.password && view.password !== req.body?.password) {
    return res.status(403).json(ErrorMessages.INVALID_SHARED_VIEW_PASSWORD);
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

  let body = req.body?.data;

  if (typeof body === 'string') body = JSON.parse(body);

  const insertObject = Object.entries(body).reduce((obj, [key, val]) => {
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

async function relDataList(req, res) {
  const view = await View.getByUUID(req.params.publicDataUuid);

  if (!view) NcError.notFound('Not found');
  if (view.type !== ViewTypes.FORM) NcError.notFound('Not found');

  if (view.password && view.password !== req.body?.password) {
    NcError.forbidden(ErrorMessages.INVALID_SHARED_VIEW_PASSWORD);
  }

  const column = await Column.get({ colId: req.params.columnId });
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

  const base = await Base.get(model.base_id);

  const baseModel = await Model.getBaseModelSQL({
    id: model.id,
    viewId: view?.id,
    dbDriver: NcConnectionMgrv2.get(base)
  });

  const key = `${model._tn}List`;
  const requestObj = {
    [key]: await baseModel.defaultResolverReq(req.query, true)
  };

  const data = (
    await nocoExecute(
      requestObj,
      {
        [key]: async args => {
          return await baseModel.list(args);
        }
      },
      {},
      { nested: { [key]: req.query } }
    )
  )?.[key];

  const count = await baseModel.count(req.query);

  res.json(
    new PagedResponseImpl(data, {
      // todo:
      totalRows: count,
      pageSize: 25,
      page: 1
    })
  );
}

/*
export async function mmList(req: Request, res: Response): Promise<any> {
  const view = await View.getByUUID(req.params.publicDataUuid);

  if (!view) NcError.notFound('Not found');
  if (view.type !== ViewTypes.GRID) NcError.notFound('Not found');

  if (view.password && view.password !== req.body?.password) {
    NcError.forbidden(ErrorMessages.INVALID_SHARED_VIEW_PASSWORD);
  }

  const column = await Column.get({ colId: req.params.columnId });

  if (column.fk_model_id !== view.fk_model_id)
    NcError.badRequest("Column doesn't belongs to the model");

  // const colOptions = await column.getColOptions<LinkToAnotherRecordColumn>();

  const base = await Base.get(view.base_id);
  const baseModel = await Model.getBaseModelSQL({
    viewId: view?.id,
    id: view?.fk_model_id,
    dbDriver: NcConnectionMgrv2.get(base)
  });

  const key = column._cn;
  const requestObj: any = {
    [key]: 1
  };

  const data = (
    await nocoExecute(
      requestObj,
      {
        [key]: async _args => {
          return (
            await baseModel.mmList({
              colId: req.params.columnId,
              parentIds: [req.params.rowId]
            })
          )?.[0];
        }
      },
      {},
      { nested: { [key]: req.query } }
    )
  )?.[key];

  const count = (
    await baseModel.mmListCount({
      colId: req.params.columnId,
      parentIds: [req.params.rowId]
    })
  )?.[0]?.count;

  res.json({
    data: new PagedResponseImpl(data, {
      // todo:
      totalRows: count,
      pageSize: 25,
      page: 1
    })
  });
}

export async function hmList(req: Request, res: Response): Promise<any> {
  const view = await View.getByUUID(req.params.publicDataUuid);

  if (!view) NcError.notFound('Not found');
  if (view.type !== ViewTypes.GRID) NcError.notFound('Not found');

  if (view.password && view.password !== req.body?.password) {
    NcError.forbidden(ErrorMessages.INVALID_SHARED_VIEW_PASSWORD);
  }

  const column = await Column.get({ colId: req.params.columnId });

  if (column.fk_model_id !== view.fk_model_id)
    NcError.badRequest("Column doesn't belongs to the model");

  // const colOptions = await column.getColOptions<LinkToAnotherRecordColumn>();

  const base = await Base.get(view.base_id);
  const baseModel = await Model.getBaseModelSQL({
    viewId: view?.id,
    id: view?.fk_model_id,
    dbDriver: NcConnectionMgrv2.get(base)
  });

  const key = column._cn;
  const requestObj: any = {
    [key]: 1
  };

  const data = (
    await nocoExecute(
      requestObj,
      {
        [key]: async _args => {
          return (
            await baseModel.hmList({
              colId: req.params.columnId,
              ids: [req.params.rowId]
            })
          )?.[req.params.rowId];
        }
      },
      {},
      { nested: { [key]: req.query } }
    )
  )?.[key];

  const count = (
    await baseModel.hmListCount({
      colId: req.params.columnId,
      ids: [req.params.rowId]
    })
  )?.[0]?.count;

  res.json({
    data: new PagedResponseImpl(data, {
      // todo:
      totalRows: count,
      pageSize: 25,
      page: 1
    })
  });
}


*/

export async function publicMmList(req: Request, res: Response) {
  const view = await View.getByUUID(req.params.publicDataUuid);

  if (!view) NcError.notFound('Not found');
  if (view.type !== ViewTypes.GRID) NcError.notFound('Not found');

  if (view.password && view.password !== req.body?.password) {
    NcError.forbidden(ErrorMessages.INVALID_SHARED_VIEW_PASSWORD);
  }

  const column = await Column.get({ colId: req.params.colId });

  if (column.fk_model_id !== view.fk_model_id)
    NcError.badRequest("Column doesn't belongs to the model");

  const base = await Base.get(view.base_id);

  const baseModel = await Model.getBaseModelSQL({
    id: view.fk_model_id,
    viewId: view?.id,
    dbDriver: NcConnectionMgrv2.get(base)
  });

  const key = `List`;
  const requestObj: any = {
    [key]: 1
  };

  const data = (
    await nocoExecute(
      requestObj,
      {
        [key]: async args => {
          return (
            await baseModel.mmList(
              {
                colId: req.params.colId,
                parentIds: [req.params.rowId]
              },
              args
            )
          )?.[0];
        }
      },
      {},

      { nested: { [key]: req.query } }
    )
  )?.[key];

  const count = (
    await baseModel.mmListCount({
      colId: req.params.colId,
      parentIds: [req.params.rowId]
    })
  )?.[0]?.count;

  res.json(
    new PagedResponseImpl(data, {
      totalRows: count
    })
  );
}

export async function publicHmList(req: Request, res: Response) {
  const view = await View.getByUUID(req.params.publicDataUuid);

  if (!view) NcError.notFound('Not found');
  if (view.type !== ViewTypes.GRID) NcError.notFound('Not found');

  if (view.password && view.password !== req.body?.password) {
    NcError.forbidden(ErrorMessages.INVALID_SHARED_VIEW_PASSWORD);
  }

  const column = await Column.get({ colId: req.params.colId });

  if (column.fk_model_id !== view.fk_model_id)
    NcError.badRequest("Column doesn't belongs to the model");

  const base = await Base.get(view.base_id);

  const baseModel = await Model.getBaseModelSQL({
    id: view.fk_model_id,
    viewId: view?.id,
    dbDriver: NcConnectionMgrv2.get(base)
  });

  const key = `List`;
  const requestObj: any = {
    [key]: 1
  };

  const data = (
    await nocoExecute(
      requestObj,
      {
        [key]: async args => {
          return (
            await baseModel.hmList(
              {
                colId: req.params.colId,
                ids: [req.params.rowId]
              },
              args
            )
          )?.[req.params.rowId];
        }
      },
      {},
      { nested: { [key]: req.query } }
    )
  )?.[key];

  const count = (
    await baseModel.hmListCount({
      colId: req.params.colId,
      ids: [req.params.rowId]
    })
  )?.[0];

  res.json(
    new PagedResponseImpl(data, {
      totalRows: count
    } as any)
  );
}
/*

export async function mmExcludedList(req: Request, res: Response) {
  const view = await View.getByUUID(req.params.publicDataUuid);

  if (!view) NcError.notFound('Not found');
  if (view.type !== ViewTypes.GRID) NcError.notFound('Not found');

  if (view.password && view.password !== req.body?.password) {
    NcError.forbidden(ErrorMessages.INVALID_SHARED_VIEW_PASSWORD);
  }

  const column = await Column.get({ colId: req.params.colId });

  if (column.fk_model_id !== view.fk_model_id)
    NcError.badRequest("Column doesn't belongs to the model");

  const base = await Base.get(view.base_id);

  const baseModel = await Model.getBaseModelSQL({
    id: view.fk_model_id,
    viewId: view?.id,
    dbDriver: NcConnectionMgrv2.get(base)
  });

  const key = 'List';
  const requestObj: any = {
    [key]: 1
  };

  const data = (
    await nocoExecute(
      requestObj,
      {
        [key]: async args => {
          return await baseModel.getMmChildrenExcludedList(
            {
              colId: req.params.colId,
              pid: req.params.rowId
            },
            args
          );
        }
      },
      {},

      { nested: { [key]: req.query } }
    )
  )?.[key];

  const count = await baseModel.getMmChildrenExcludedListCount(
    {
      colId: req.params.colId,
      pid: req.params.rowId
    },
    req.query
  );

  res.json(
    new PagedResponseImpl(data, {
      totalRows: count
    })
  );
}

export async function hmExcludedList(req: Request, res: Response) {
  const view = await View.getByUUID(req.params.publicDataUuid);

  if (!view) NcError.notFound('Not found');
  if (view.type !== ViewTypes.GRID) NcError.notFound('Not found');

  if (view.password && view.password !== req.body?.password) {
    NcError.forbidden(ErrorMessages.INVALID_SHARED_VIEW_PASSWORD);
  }

  const column = await Column.get({ colId: req.params.colId });

  if (column.fk_model_id !== view.fk_model_id)
    NcError.badRequest("Column doesn't belongs to the model");

  const base = await Base.get(view.base_id);

  const baseModel = await Model.getBaseModelSQL({
    id: view.fk_model_id,
    viewId: view?.id,
    dbDriver: NcConnectionMgrv2.get(base)
  });

  const key = 'List';
  const requestObj: any = {
    [key]: 1
  };

  const data = (
    await nocoExecute(
      requestObj,
      {
        [key]: async args => {
          return await baseModel.getHmChildrenExcludedList(
            {
              colId: req.params.colId,
              pid: req.params.rowId
            },
            args
          );
        }
      },
      {},

      { nested: { [key]: req.query } }
    )
  )?.[key];

  const count = await baseModel.getHmChildrenExcludedListCount(
    {
      colId: req.params.colId,
      pid: req.params.rowId
    },
    req.query
  );

  res.json(
    new PagedResponseImpl(data, {
      totalRows: count
    })
  );
}
export async function btExcludedList(req: Request, res: Response) {
  const view = await View.getByUUID(req.params.publicDataUuid);

  if (!view) NcError.notFound('Not found');
  if (view.type !== ViewTypes.GRID) NcError.notFound('Not found');

  if (view.password && view.password !== req.body?.password) {
    NcError.forbidden(ErrorMessages.INVALID_SHARED_VIEW_PASSWORD);
  }

  const column = await Column.get({ colId: req.params.colId });

  if (column.fk_model_id !== view.fk_model_id)
    NcError.badRequest("Column doesn't belongs to the model");

  const base = await Base.get(view.base_id);

  const baseModel = await Model.getBaseModelSQL({
    id: view.fk_model_id,
    viewId: view?.id,
    dbDriver: NcConnectionMgrv2.get(base)
  });

  const key = 'List';
  const requestObj: any = {
    [key]: 1
  };

  const data = (
    await nocoExecute(
      requestObj,
      {
        [key]: async args => {
          return await baseModel.getBtChildrenExcludedList(
            {
              colId: req.params.colId,
              cid: req.params.rowId
            },
            args
          );
        }
      },
      {},

      { nested: { [key]: req.query } }
    )
  )?.[key];

  const count = await baseModel.getBtChildrenExcludedListCount(
    {
      colId: req.params.colId,
      cid: req.params.rowId
    },
    req.query
  );

  res.json(
    new PagedResponseImpl(data, {
      totalRows: count
    })
  );
}
*/

const router = Router({ mergeParams: true });
router.post('/public/data/:publicDataUuid/list', catchError(dataList));
router.post(
  '/public/data/:publicDataUuid/relationTable/:columnId',
  catchError(relDataList)
);
router.post(
  '/public/data/:publicDataUuid/create',
  multer({
    storage: multer.diskStorage({})
  }).any(),
  catchError(dataInsert)
);

router.get(
  '/public/data/:publicDataUuid/:rowId/mm/:colId',
  catchError(publicMmList)
);
router.get(
  '/public/data/:publicDataUuid/:rowId/hm/:colId',
  catchError(publicHmList)
);

// router.get(
//   '/public/data/:publicDataUuid/:rowId/mm/:columnId/exclude',
//   catchError(mmExcludedList)
// );
// router.get(
//   '/public/data/:publicDataUuid/:rowId/hm/:columnId/exclude',
//   catchError(hmExcludedList)
// );
// router.get(
//   '/public/data/:publicDataUuid/:rowId/bt/:columnId/exclude',
//   catchError(btExcludedList)
// );

export default router;
