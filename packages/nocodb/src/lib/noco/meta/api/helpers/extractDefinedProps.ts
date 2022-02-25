export default function extractDefinedProps(body: any, props) {
  return props.reduce((o, key) => {
    if (key in body) o[key] = body[key];
    return body;
  }, {});
}
