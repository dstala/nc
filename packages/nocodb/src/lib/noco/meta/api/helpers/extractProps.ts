export default function extractProps(body: any, props: string[]) {
  return props.reduce((o, key) => {
    if (key in body) o[key] = body[key];
    return o;
  }, {});
}
