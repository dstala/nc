import User from './User';
import Password from './Password';
import Token from './Token';

export default class Auth {
  public static signup() {}
  public static signin() {}
  public static signout() {}

  public static user = User;
  public static password = Password;
  public static token = Token;
}
