import React, { useState } from 'react';
import { Keyboard, View } from 'react-native';
import Layout from '@/components/layout';
import Styles from '@/components/styles';
import Logo from '@/components/widgets/logo';
import { UserRegisterErrorType, UserRegisterType } from '@/components/types';

import { post } from '@/data/api.handler';
import { routeConfig } from '@/constant/route';

import {
  addPrefixIfNotExist,
  isEmpty,
  isValidPhoneNumber,
} from '@/components/functions';
import { deleteTempUser, getTempUser, storeUser } from '@/data/store.data';
import VerifyForm from '@/components/widgets/acount/verify';
import { ALERT_TYPE, Dialog } from 'react-native-alert-notification';

function CompleteRegistrationScreen({ navigation }: { navigation: any }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string>('');
  const [info, setInfo] = useState<UserRegisterType>({
    email: '',
  });
  const [error, setError] = useState<UserRegisterErrorType>({
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
      email: false,
    });
  };

  const handleSubmit = async () => {
    try {
      const tempuser = await getTempUser('auth');
      const email = tempuser?.email ?? '';
      if (!email && isEmpty(email ?? '')) {
        setError({
          ...error,
          email: true,
        });
        setMessage('Kindly type correct email address');
      } else {
        setLoading(true);
        let data = {
          email: email,
        };
        const res = await post(routeConfig.sendOtp, data, tempuser?.token);
        if (res && res.status_code == 200) {
          setInfo(data);
          setError({
            email: false,
          });
        } else {
          setMessage(
            'The credentials are incorrect; kindly attempt the process once more.',
          );
          setError({
            email: true,
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

  const handleVerify = async () => {
    try {
      Keyboard.dismiss();
      const tempuser = await getTempUser('auth');
      const { verify_code } = info;
      if (!tempuser?.email && isEmpty(tempuser?.email ?? '')) {
        setError({
          ...error,
          email: true,
        });
        setMessage('Kindly type correct email address');
      } else if (verify_code && isEmpty(verify_code)) {
        setError({
          ...error,
          verify_code: true,
        });
        setMessage('Please enter the OTP sent to your email address: ' + tempuser?.email);
      } else {
        setLoading(true);
        let data = {
          ...info,
          verify_code: verify_code,
          email: tempuser?.email
        };

        const res = await post(routeConfig.verifyOtp, data, tempuser?.token);
        if (res && res.status_code == 200) {
          await deleteTempUser();
          await storeUser(res.data);
          Dialog.show({
            type: ALERT_TYPE.SUCCESS,
            title: 'SUCCESSFULLY',
            textBody:
              'Congratulations, your account has been successfully created.',
            button: 'continue',
            autoClose: true,
            closeOnOverlayTap: false,
            onHide: () => {
              navigation.reset({
                index: 0,
                routes: [{ name: 'AuthStack' }],
              });
            },
          });
        } else if (res && res.status_code == 201) {
          await deleteTempUser();
          Dialog.show({
            type: ALERT_TYPE.SUCCESS,
            title: 'INFORMATION',
            textBody:
              'Your account is under review, we will get back to you shortly',
            autoClose: true,
            closeOnOverlayTap: false,
            onHide: () => {
              navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
              });
            },
          });
        } else {
          Dialog.show({
            type: ALERT_TYPE.DANGER,
            title: 'WARNING',
            textBody:
              'It appears that an issue has occurred. Please review your details and try again.',
            button: 'close',
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
      snackVisable={error.email || error.verify_code}>
      <View style={Styles.center}>
        <Logo width={200} height={250} />
        <VerifyForm
          loading={loading}
          handleSubmit={handleVerify}
          handleResend={handleSubmit}
          info={info}
          error={error}
          handleChange={handleChange}
        />
      </View>
    </Layout>
  );
}

export default CompleteRegistrationScreen;
