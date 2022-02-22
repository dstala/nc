import Noco from '../noco/Noco';
import { MetaTable } from '../utils/globals';
import { FormType } from 'nc-common';
import FormViewColumn from './FormViewColumn';

export default class FormView implements FormType {
  show: boolean;
  is_default: boolean;
  order: number;
  title?: string;
  heading?: string;
  subheading?: string;
  success_msg?: string;
  redirect_url?: string;
  redirect_after_secs?: string;
  email?: string;
  banner_image_url?: string;
  logo_url?: string;
  submit_another_form?: boolean;
  show_blank_form?: boolean;

  fk_view_id: string;
  columns?: FormViewColumn[];

  constructor(data: FormView) {
    Object.assign(this, data);
  }

  public static async get(viewId: string) {
    const view = await Noco.ncMeta.metaGet2(null, null, MetaTable.FORM_VIEW, {
      fk_view_id: viewId
    });

    return view && new FormView(view);
  }

  static async insert(view: Partial<FormView>) {
    await Noco.ncMeta.metaInsert2(
      null,
      null,
      MetaTable.FORM_VIEW,
      {
        fk_view_id: view.fk_view_id
      },
      true
    );

    return this.get(view.fk_view_id);
  }

  static async update(formId: string, body: Partial<FormView>) {
    return await Noco.ncMeta.metaUpdate(
      null,
      null,
      MetaTable.FORM_VIEW,
      {
        title: body.title,
        heading: body.heading,
        subheading: body.subheading,
        success_msg: body.success_msg,
        redirect_url: body.redirect_url,
        redirect_after_secs: body.redirect_after_secs,
        email: body.email,
        banner_image_url: body.banner_image_url,
        logo_url: body.logo_url,
        submit_another_form: body.submit_another_form,
        show_blank_form: body.show_blank_form
      },
      {
        fk_view_id: formId
      }
    );
  }

  async getColumns() {
    return (this.columns = await FormViewColumn.list(this.fk_view_id));
  }

  static async getWithInfo(formViewId: string) {
    const form = await this.get(formViewId);
    await form.getColumns();
    return form;
  }
}
