import Filter from './Filter';
import Sort from './Sort';
import Share from './Share';
import NcListResponse from '../../types/common/NcListResponse';
import NcBase from '../../types/NcBase';

export default class CalendarView {
  public static list(): Promise<NcListResponse<NcBase>> {
    return Promise.resolve(null);
  }
  public static create() {}
  public static update() {}
  public static delete() {}
  public static rename() {}
  public static filter = Filter;
  public static sort = Sort;
  public static share = Share;
}
