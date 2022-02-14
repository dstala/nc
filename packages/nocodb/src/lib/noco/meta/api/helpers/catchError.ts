export default function(callback: (req: any, res: any, next?: any) => any) {
  return async function(req: any, res: any, next: any) {
    try {
      return await callback(req, res, next);
    } catch (e) {
      console.log(callback.name, '::', e);
      next(e);
    }
  };
}
