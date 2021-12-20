import {NcContextV2} from "../NcMetaMgrv2";
import Column from "../../../noco-models/Column";

export default async function(this:NcContextV2, args:any){

  Column.insert(args.args)


}