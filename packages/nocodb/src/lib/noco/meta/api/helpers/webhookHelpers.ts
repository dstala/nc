import Handlebars from 'handlebars';
import { HookType } from 'nc-common';
import Model from '../../../../noco-models/Model';
import NcPluginMgrv2 from './NcPluginMgrv2';
import Column from '../../../../noco-models/Column';

export function parseBody(
  template: string,
  user: any,
  data: any,
  payload: any
): string {
  if (!template) {
    return template;
  }

  return Handlebars.compile(template, { noEscape: true })({
    data,
    user,
    payload,
    env: process.env
  });
}

export function validateCondition(condition: any, data: any, _req: any) {
  if (!condition || !condition.length) {
    return true;
  }

  const isValid = condition.reduce((valid, con) => {
    let res;
    const field = con.field;
    let val = data[field];
    switch (typeof con.value) {
      case 'boolean':
        val = !!data[field];
        break;
      case 'number':
        val = !!data[field];
        break;
    }
    switch (con.op as string) {
      case 'is equal':
        res = val === con.value;
        break;
      case 'is not equal':
        res = val !== con.value;
        break;
      case 'is like':
        res =
          data[field]?.toLowerCase()?.indexOf(con.value?.toLowerCase()) > -1;
        break;
      case 'is not like':
        res =
          data[field]?.toLowerCase()?.indexOf(con.value?.toLowerCase()) === -1;
        break;
      case 'is empty':
        res =
          data[field] === '' ||
          data[field] === null ||
          data[field] === undefined;
        break;
      case 'is not empty':
        res = !(
          data[field] === '' ||
          data[field] === null ||
          data[field] === undefined
        );
        break;
      case 'is null':
        res = res = data[field] === null;
        break;
      case 'is not null':
        res = data[field] !== null;
        break;

      /*   todo:     case '<':
                return condition + `~not(${filt.field},lt,${filt.value})`;
              case '<=':
                return condition + `~not(${filt.field},le,${filt.value})`;
              case '>':
                return condition + `~not(${filt.field},gt,${filt.value})`;
              case '>=':
                return condition + `~not(${filt.field},ge,${filt.value})`;*/
    }

    return con.logicOp === 'or' ? valid || res : valid && res;
  }, true);

  return isValid;
}

export async function handleHttpWebHook(apiMeta, apiReq, data) {
  // try {
  const req = axiosRequestMake(apiMeta, apiReq, data);
  await require('axios')(req);
  // } catch (e) {
  //   console.log(e);
  // }
}

export function axiosRequestMake(_apiMeta, apiReq, data) {
  const apiMeta = { ..._apiMeta };
  if (apiMeta.body) {
    try {
      apiMeta.body = JSON.parse(apiMeta.body, (_key, value) => {
        return typeof value === 'string'
          ? parseBody(value, apiReq, data, apiMeta)
          : value;
      });
    } catch (e) {
      apiMeta.body = parseBody(apiMeta.body, apiReq, data, apiMeta);
      console.log(e);
    }
  }
  if (apiMeta.auth) {
    try {
      apiMeta.auth = JSON.parse(apiMeta.auth, (_key, value) => {
        return typeof value === 'string'
          ? parseBody(value, apiReq, data, apiMeta)
          : value;
      });
    } catch (e) {
      apiMeta.auth = parseBody(apiMeta.auth, apiReq, data, apiMeta);
      console.log(e);
    }
  }
  apiMeta.response = {};
  const req = {
    params: apiMeta.parameters
      ? apiMeta.parameters.reduce((paramsObj, param) => {
          if (param.name && param.enabled) {
            paramsObj[param.name] = parseBody(
              param.value,
              apiReq,
              data,
              apiMeta
            );
          }
          return paramsObj;
        }, {})
      : {},
    url: parseBody(apiMeta.path, apiReq, data, apiMeta),
    method: apiMeta.method,
    data: apiMeta.body,
    headers: apiMeta.headers
      ? apiMeta.headers.reduce((headersObj, header) => {
          if (header.name && header.enabled) {
            headersObj[header.name] = parseBody(
              header.value,
              apiReq,
              data,
              apiMeta
            );
          }
          return headersObj;
        }, {})
      : {},
    withCredentials: true
  };
  return req;
}

export async function invokeWebhook(hook: HookType, model: Model, data, user) {
  // for (const hook of hooks) {
  const notification =
    typeof hook.notification === 'string'
      ? JSON.parse(hook.notification)
      : hook.notification;

  console.log('Hook handler ::::' + model.tn + ':: Hook ::', hook);
  console.log('Hook handler ::::' + model.tn + ':: Data ::', data);

  /* todo:
      if (!validateCondition(hook.condition, data, req)) {
        continue;
      }*/

  switch (notification?.type) {
    case 'Email':
      await (await NcPluginMgrv2.emailAdapter())?.mailSend({
        to: parseBody(
          notification?.payload?.to,
          user,
          data,
          notification?.payload
        ),
        subject: parseBody(
          notification?.payload?.subject,
          user,
          data,
          notification?.payload
        ),
        html: parseBody(
          notification?.payload?.body,
          user,
          data,
          notification?.payload
        )
      });
      break;
    case 'URL':
      await handleHttpWebHook(notification?.payload, user, data);
      break;
    default:
      await (
        await NcPluginMgrv2.webhookNotificationAdapters(notification.type)
      ).sendMessage(
        parseBody(
          notification?.payload?.body,
          user,
          data,
          notification?.payload
        ),
        JSON.parse(JSON.stringify(notification?.payload), (_key, value) => {
          return typeof value === 'string'
            ? parseBody(value, user, data, notification?.payload)
            : value;
        })
      );
      // }
      break;
  }
}

export function _transformSubmittedFormDataForEmail(
  data,
  // @ts-ignore
  formView,
  // @ts-ignore
  columns: Column[]
) {
  const transformedData = { ...data };

  for (const col of columns) {
    if (!formView.query_params?.showFields?.[col._cn]) {
      delete transformedData[col._cn];
      continue;
    }

    if (col.uidt === 'Attachment') {
      if (typeof transformedData[col._cn] === 'string') {
        transformedData[col._cn] = JSON.parse(transformedData[col._cn]);
      }
      transformedData[col._cn] = (transformedData[col._cn] || [])
        .map(attachment => {
          if (
            ['jpeg', 'gif', 'png', 'apng', 'svg', 'bmp', 'ico', 'jpg'].includes(
              attachment.title.split('.').pop()
            )
          ) {
            return `<a href="${attachment.url}" target="_blank"><img height="50px" src="${attachment.url}"/></a>`;
          }
          return `<a href="${attachment.url}" target="_blank">${attachment.title}</a>`;
        })
        .join('&nbsp;');
    } else if (
      transformedData[col._cn] &&
      typeof transformedData[col._cn] === 'object'
    ) {
      transformedData[col._cn] = JSON.stringify(transformedData[col._cn]);
    }
  }
}
