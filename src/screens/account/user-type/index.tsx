import Layout from '@/components/layout';
import Styles from '@/components/styles';
import { UserAccountType } from '@/components/types';
import Logo from '@/components/widgets/logo';
import { Colors } from '@/constant/color';
import { routeConfig } from '@/constant/route';
import { get, multipart } from '@/data/api.handler';
import React, { useEffect, useState } from 'react';
import { ImageBackground, TouchableOpacity, View } from 'react-native';
import { ActivityIndicator, Button, Icon, Text } from 'react-native-paper';
import { launchImageLibrary } from 'react-native-image-picker';
import { deleteTempUser, getTempUser, storeUser } from '@/data/store.data';
import { ALERT_TYPE, Dialog } from 'react-native-alert-notification';
import AutoComplete from '@/components/widgets/autocomplete';
import CustomCard from '@/components/widgets/card';
import ID from '@/components/widgets/ID';
import { SafeAreaProvider } from 'react-native-safe-area-context';

function UserTypeScreen({ navigation }: any) {
  const [message, setMessage] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState<UserAccountType>();
  const [types, setTypes] = useState<UserAccountType[]>([]);
  const [reqDocument, setReqDocument] = useState(false);
  const [imageSource, setImageSource] = useState<string>();
  const [backImageSource, setBackImageSource] = useState<string>();

  const onDismiss = () => { };

  const handleSelect = (key: string, type: UserAccountType) => {
    setType(type);
    if (type.document) {
      setReqDocument(true);
    } else {
      setReqDocument(false);
    }
  };

  const uploadID = async () => {
    try {
      const res = await launchImageLibrary({
        mediaType: 'photo',
        maxWidth: 1920,
        maxHeight: 1080,
        selectionLimit: 1,
        quality: 1,
        presentationStyle: 'popover',
      });
      if (res && res.assets) {
        setImageSource(res.assets[0].uri);
      }
    } catch (e) {
      console.log(e);
    }
  };
  const uploadBackID = async () => {
    try {
      const res = await launchImageLibrary({
        mediaType: 'photo',
        maxWidth: 1920,
        maxHeight: 1080,
        selectionLimit: 1,
        quality: 1,
        presentationStyle: 'popover',
      });
      if (res && res.assets) {
        setBackImageSource(res.assets[0].uri);
      }
    } catch (e) {
      console.log(e);
    }
  };
  const removeID = () => {
    setImageSource(undefined);
  };

  const removeBackID = () => {
    setBackImageSource(undefined);
  };

  const finish = async () => {
    try {
      setLoading(true);
      const tempuser = await getTempUser('auth');
      const formData = new FormData();
      if (type?.document) {
        formData.append('files[]', {
          uri: imageSource,
          type: 'image/jpeg', // Adapt file type if needed
          name: 'my_image.jpg', // Optional filename
        });
        formData.append('files[]', {
          uri: backImageSource,
          type: 'image/jpeg', // Adapt file type if needed
          name: 'my_image.jpg', // Optional filename
        });
        
      }
      formData.append('type_id', type?.id);

      const res = await multipart(
        routeConfig.finishRegistration + '/' + tempuser?.id,
        formData,
        tempuser?.token,
      );
      if (res && (res.status_code == 200 || res.status_code == 201)) {
        navigation.push('VerifyAccount');
      } else {
        Dialog.show({
          type: ALERT_TYPE.DANGER,
          title: 'WARNING',
          textBody:
            'It appears that an issue has occurred. Please review your details and try again.',
          button: 'close',
        });
      }
      setLoading(false);
    } catch (e) {
      console.log(e);
      setLoading(false);
    }
  };

  return (
    <Layout
      removeSpace
      snackDismiss={onDismiss}
      snackTitle={message}
      snackVisable={message != ''}>
    <SafeAreaProvider>
       <View style={[Styles.center]}>
        <Logo width={150} height={200} />
        <CustomCard
          title="Additional Information"
          subtitle="User role"
          style={{ paddingVertical: 0 }}

          loading={loading}
          additional_action={[
            {
              title: 'Login',
              subtitle: 'Have an account?',
              action: () => {
                deleteTempUser();
                navigation.reset({
                  index: 0,
                  routes: [{ name: 'Login' }],
                });
              },
              type: 'text',
              color: Colors.primary,
            },
          ]}>
          {loading ? (
            <ActivityIndicator size={40} color={Colors.secondary} />
          ) : (
            <View style={[Styles.flexRow]}>

              <View style={[Styles.flexColumn, { marginVertical: 20 }]}>
                <View style={{ ...Styles.flexColumn, gap: 20 }}>
                  <View>
                    <Text style={Styles.darkBoldText}>User Role</Text>
                    <AutoComplete
                      url={routeConfig.types}
                      title="type"
                      value={type}
                      handleChange={handleSelect}
                    />
                  </View>
                  <View>
                    {reqDocument ? (
                      <View style={{...Styles.flexColumn,gap:10}}>
                        <Text style={Styles.darkBoldText}>User ID</Text>
                        <ID title='Upload The front side of your ID' imageSource={imageSource} removeID={removeID} uploadID={uploadID}/>
                        <ID title='Upload The back side of your ID' imageSource={backImageSource} removeID={removeBackID} uploadID={uploadBackID}/>


                      </View>
                    ) : null}
                  </View>
                  <View style={[Styles.fixedButton, { alignSelf: 'center' }]}>
                    <TouchableOpacity onPress={finish}>
                      <Text
                        style={[
                          Styles.boldText,
                          { textAlign: 'center', fontSize: 16 },
                        ]}>
                        Next
                      </Text>
                    </TouchableOpacity>

                  </View>

                </View>
              </View>
            </View>
          )}
        </CustomCard>

      </View>
      </SafeAreaProvider>  

    </Layout>
  );
}

export default UserTypeScreen;
