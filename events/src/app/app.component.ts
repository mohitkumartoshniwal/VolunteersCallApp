import { Component, ViewChild } from '@angular/core';
import { Platform, Nav,AlertController, Icon } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import firebase from 'firebase';
import { EventlistPage } from '../pages/eventlist/eventlist';
import { SigninPage } from '../pages/signin/signin';
import { SignupPage } from '../pages/signup/signup';
import { settingsPage } from '../pages/settings/settings';
import { NewsPage } from '../pages/news/news';
// import { AddeventPage } from '../pages/addevent/addevent';
// import {EventdetailsPage} from '../pages/eventdetails/eventdetails';
import { ProfilePage } from '../pages/profile/profile';
import {AuthService} from '../services/auth'
import { AddeventPage } from '../pages/addevent/addevent';
import { AddnewsPage } from '../pages/addnews/addnews';
import { AdmineventslistPage } from '../pages/admineventslist/admineventslist';
//import { ENV } from '@app/env';
import { ENV } from '../environments/environment.dev';
import { Push, PushObject, PushOptions } from '@ionic-native/push';
@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild (Nav) nav: Nav; //can't inject nav controller in the constructor in the root component
  rootPage:any = EventlistPage;
  eventsListPage=EventlistPage;
  signinPage = SigninPage;
  signupPage = SignupPage;
  isAuthenticated = false;
  uid:any;
  userRole:any;

  show: boolean = false;
  pages: Array<{title: string, component: any,icon:string}>;
  constructor(private authService:AuthService,platform: Platform, statusBar: StatusBar, splashScreen: SplashScreen,public push: Push,public alertCtrl: AlertController) {
    firebase.initializeApp(ENV);
    firebase.auth().onAuthStateChanged(user => {
      if (user) {

        this.isAuthenticated = true;
        this.rootPage=EventlistPage;//as firebase checks the user state asynchronously before the nav gets initialized
        this.show = true;
      } else {
        this.isAuthenticated = false;
        this.rootPage=SigninPage;
      }
      if(!this.isAuthenticated){

        //this.rootPage=SigninPage;
       this.pages = [
          { title: 'SignIn', component: SigninPage , icon: "log-in"},
         // { title: 'Register', component: SignupPage, icon: "book"}
        ];
      }else{
        this.uid = this.authService.getActiveUser().uid;
        firebase.database().ref('volunteers/'+this.uid).once('value').then((snapshot) =>{
          this.userRole=snapshot.val().role;
          if(this.userRole=="admin")
          {
            console.log('refereshed');
            this.pages = [
              { title: 'News', component: NewsPage, icon: "paper"},
              { title: 'Events', component: EventlistPage, icon: "albums" },
              { title: 'Profile', component: ProfilePage , icon: "person"},
             // { title: 'Settings', component: settingsPage, icon: "settings"},
              { title: 'Add Event',component:AddeventPage,icon:"add-circle"},
              { title: 'Add News',component:AddnewsPage,icon:"logo-hackernews"},
              { title: 'Event Registrations',component:AdmineventslistPage,icon:"people"}
            ];
          }
          if(this.userRole=="user")
          {
            this.pages = [
              { title: 'News', component: NewsPage, icon: "paper"},
              { title: 'Events', component: EventlistPage, icon: "albums" },
              { title: 'Profile', component: ProfilePage , icon: "person"},
             // { title: 'Settings', component: settingsPage, icon: "settings"}
              
    
    
            ];
  
          }
          console.log(this.userRole+'refreshed');
        });
       
        
      }

    });
    this.initPushNotification();

    // platform.ready().then(() => {
    //   // Okay, so the platform is ready and our plugins are available.
    //   // Here you can do any higher level native things you might need.
    //   statusBar.styleDefault();
    //   splashScreen.hide();
    // });
    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      statusBar.styleDefault();
      if (platform.is('android')) {
        statusBar.overlaysWebView(false);
        statusBar.backgroundColorByHexString('#000000');
        
    }
      splashScreen.hide();
    });
  }
  initPushNotification(){

    const options: PushOptions = {
      android: {
        senderID: "333057397510"
      }
    };
  
    const pushObject: PushObject = this.push.init(options);
  
      pushObject.on('registration').subscribe((data: any) => {
        console.log("device token:", data.registrationId);
  
        let alert = this.alertCtrl.create({
                    title: 'device token',
                    subTitle: data.registrationId,
                    buttons: ['OK']
                  });
                  alert.present();
  
      });
  
      pushObject.on('notification').subscribe((data: any) => {
        console.log('message', data.message);
        if (data.additionalData.foreground) {
          let confirmAlert = this.alertCtrl.create({
            title: 'New Notification',
            message: data.message,
            buttons: [{
              text: 'Ignore',
              role: 'cancel'
            }, {
              text: 'View',
              handler: () => {
                //TODO: Your logic here
              }
            }]
          });
          confirmAlert.present();
        } else {
        let alert = this.alertCtrl.create({
                    title: 'clicked on',
                    subTitle: "you clicked on the notification!",
                   buttons: ['OK']
                  });
                  alert.present();
          console.log("Push notification clicked");
        }
     });
  
      pushObject.on('error').subscribe(error => console.error('Error with Push plugin', error));
    }
  
  onLogOut(){
    this.authService.logOut();
    this.show = false;
  }

  openPage(page) {
    // Reset the content nav to have just this page
    // we wouldn't want the back button to show in this scenario
    this.rootPage=page.component
    //this.nav.setRoot(page.Component);
  }
}
