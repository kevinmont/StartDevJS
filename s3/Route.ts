import {Controller} from '../Controller/Controller';


export class Routes {
    public controller: Controller= new Controller();
    public RouteApp(app:any): void {

        app.route('/ping')
            .post((req:any,res:any)=>this.controller.ping(req,res));
    }
}