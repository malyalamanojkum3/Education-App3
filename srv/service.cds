using { my.App as app } from '../db/schema';

service myService{
    entity employee as projection on app.employee; 
    entity company as projection on app.company;
}