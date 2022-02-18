// @ts-ignore
import { Request, Response, Router } from 'express';
import catchError from './helpers/catchError';
import multer from 'multer';
import { nanoid } from 'nanoid';
import path from 'path';
import slash from 'slash';
import mimetypes, { mimeIcons } from '../../../utils/mimeTypes';
import Local from '../../plugins/adapters/storage/Local';

// todo:  use plugin manager
const storageAdapter = new Local();
export async function upload(req: Request, res: Response) {
  const destPath = path.join(
    'nc',
    'uploads',
    req.params.projectId,
    req.params.viewId
  );

  const attachments = await Promise.all(
    (req as any).files?.map(async file => {
      const fileName = `${nanoid(6)}${path.extname(file.originalname)}`;

      await storageAdapter.fileCreate(
        slash(path.join(destPath, fileName)),
        file
      );

      // todo: update base url
      return {
        url: `http://localhost:8080/download/${req.params.projectId}/${req.params.viewId}/${fileName}`,
        title: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        icon: mimeIcons[path.extname(file.originalname).slice(1)] || undefined
      };
    })
  );

  res.json(attachments);
}
export async function fileRead(req, res) {
  try {
    // const type = mimetypes[path.extname(req.params.fileName).slice(1)] || 'text/plain';
    const type =
      mimetypes[
        path
          .extname(req.params.fileName)
          .split('/')
          .pop()
          .slice(1)
      ] || 'text/plain';
    // const img = await this.storageAdapter.fileRead(slash(path.join('nc', req.params.projectId, req.params.dbAlias, 'uploads', req.params.fileName)));
    const img = await storageAdapter.fileRead(
      slash(
        path.join(
          'nc',
          'uploads',
          req.params.projectId,
          req.params.viewId,
          req.params.fileName
        )
      )
    );
    res.writeHead(200, { 'Content-Type': type });
    res.end(img, 'binary');
  } catch (e) {
    console.log(e);
    res.status(404).send('Not found');
  }
}
const router = Router({ mergeParams: true });

router.post(
  '/projects/:projectId/views/:viewId/upload',
  multer({
    storage: multer.diskStorage({})
  }).any(),
  catchError(upload)
);
router.get('/download/:projectId/:viewId/:fileName', catchError(fileRead));
export default router;