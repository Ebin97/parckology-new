import React, { useState } from 'react';
import { Dimensions, Keyboard, View } from 'react-native';
import Layout from '@/components/layout';
import Styles from '@/components/styles';
import Logo from '@/components/widgets/logo';
import CustomCard from '@/components/widgets/card';
import { UserLoginErrorType, UserLoginType } from '@/components/types';
import {
  addPrefixIfNotExist,
  isEmpty,
  isValidEmail,
  isValidPhoneNumber,
  scaledFontSize,
} from '@/components/functions';
import { post } from '@/data/api.handler';
import { routeConfig } from '@/constant/route';
import { Text, TextInput } from 'react-native-paper';
import { storeUser } from '@/data/store.data';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import { ALERT_TYPE, Dialog } from 'react-native-alert-notification';
import { TouchableOpacity } from 'react-native';
import CustomInputField from '@/components/widgets/input';

function LoginScreen({ navigation }: { navigation: any }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string>('');

  const [info, setInfo] = useState<UserLoginType>({
    password: '',
    email: '',
  });
  const [error, setError] = useState<UserLoginErrorType>({
    password: false,
    email: false,
  });
  const handleChange = (key: string, value: string) => {
    setInfo({
      ...info,
      [key]: value,
    });
  };
  const onDismiss = () => {
    setError({
      password: false,
      email: false,
    });
  };

  const handleSubmit = async () => {
    Keyboard.dismiss();
    try {
      const { email, password } = info;
      if (!isValidEmail(email)) {
        setError({
          ...error,
          email: true,
        });
        setMessage('Kindly type correct email address');
      } else if (isEmpty(password)) {
        setError({
          ...error,
          password: true,
        });
        setMessage('Kindly type correct password');
      } else {
        setLoading(true);
        let data = {
          username: info.email,
          password: info.password,
        };
        const res = await post(routeConfig.login, data, null);
        if (res && res.status_code == 200) {
          storeUser(res.data);
          navigation.reset({
            index: 0,
            routes: [{ name: 'AuthStack' }],
          });

          setError({
            email: false,
            password: false,
          });
        } else if (res && res.status_code == 202) {
          Dialog.show({
            type: ALERT_TYPE.WARNING,
            title: 'INFORMATION',
            textBody:
              'Your account is under review, we will get back to you shortly',
            button: 'close',
          });
        } else {
          setMessage(
            'The credentials are incorrect; kindly attempt the process once more.',
          );
          setError({
            email: true,
            password: true,
          });
        }
      }
      setLoading(false);
    } catch (e) {
      setMessage(
        'The credentials are incorrect; kindly attempt the process once more.',
      );
      setLoading(false);
    }
  };
  return (
    <Layout
      removeSpace
      snackDismiss={onDismiss}
      snackTitle={message}
      snackVisable={error.email || error.password}>
      <View style={[{ flex: 1, minHeight: Dimensions.get('screen').height, justifyContent: 'center', alignItems: 'center' }]}>
        <View style={[Styles.center, { marginVertical: 10, }]}>
          <Logo width={200} height={200} />
          <View style={[]}>
            <CustomCard
              title="Sign In"
              subtitle="Login"
              action={{
                title: 'Login',
                action: handleSubmit,
                type: 'contained',
                color: Colors.white,

              }}
              loading={loading}
              additional_action={[
                {
                  title: 'Register',
                  subtitle: "Don't have an account?",
                  action: () => {
                    navigation.navigate('Register');
                  },
                  type: 'text',
                  color: Colors.primary,
                },
              ]}>
              <View style={[Styles.flexRow]}>

                <View style={[Styles.flexColumn,]}>
                  <View style={{ ...Styles.flexColumn, gap: 3 }}>
                    <CustomInputField
                      label="Email Address"
                      param="email"
                      value={info?.email}
                      keyboardType={"email-address"}
                      action={handleChange}
                      error={error.email}
                      placeholder="Enter your Email Address"
                    />

                    <CustomInputField
                      label="Password"
                      param="password"
                      value={info?.password}
                      action={handleChange}
                      password
                      error={error.password}
                      placeholder="Enter your Password"
                    />


                    <View style={[Styles.flexRowEnd]}>
                      <TouchableOpacity
                        onPress={() => {
                          navigation.navigate('ForgotPassword');
                        }}>
                        <Text style={[Styles.darkBoldText, { fontSize: scaledFontSize(15) }]}>
                          Forgot Password?
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </View>
            </CustomCard>
          </View>
        </View>
      </View >
    </Layout >
  );
}

export default LoginScreen;
