import {Api} from "./Api";


// @ts-ignore
// eslint-disable-next-line functional/no-class
class CustomAPI extends Api<unknown> {
  public createFormData(input: Record<string, unknown>): FormData {
    if (input instanceof FormData) {
      return input;
    }
    return Object.keys(input || {}).reduce((formData, key) => {
      const property = input[key];
      formData.append(
        key,
        property instanceof Blob
          ? property
          : typeof property === 'object' && property !== null
            ? JSON.stringify(property)
            : `${property}`
      );
      return formData;
    }, new FormData());
  }
}



export default CustomAPI
