import Layout from '@/components/layout';
import Styles from '@/components/styles';
import { PickerPropType, ProductListType, ProductType } from '@/components/types';
import CustomButton from '@/components/widgets/button';
import ComingSoon from '@/components/widgets/coming-soon';
import Picker from '@/components/widgets/date';
import ID from '@/components/widgets/ID';
import ProductPicker from '@/components/widgets/sale/product';
import { Colors } from '@/constant/color';
import { routeConfig } from '@/constant/route';
import { get, multipart, post } from '@/data/api.handler';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, Image, ImageBackground, TouchableOpacity, View } from 'react-native';
import { ALERT_TYPE, Dialog } from 'react-native-alert-notification';
import { launchImageLibrary } from 'react-native-image-picker';
import { Button, Icon, Text } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';

const baseHeight = 800; // Width on which the font size is designed
const { width, height } = Dimensions.get("screen");
const baseIWidth = width * .8;
const scaleFactor = height / baseHeight;

function SalesScreen({ navigation }: { navigation: any }) {


  const user = useSelector((state: any) => state.user)

  const [loading, setLoading] = useState(false);
  const scaledFontSize = (size: number) => Math.round(size * scaleFactor);
  const scaledWidth = baseIWidth * scaleFactor;
  const scaledHeight = baseHeight * scaleFactor;
  const [date, setDate] = useState(new Date());
  const [products, setProducts] = useState<ProductListType[]>([
  ]);
  const [items, setItems] = useState<ProductType[]>([
  ]);
  const [imageSource, setImageSource] = useState<string>();
  const [popup, setPopup] = useState<boolean>(false);

  const allReceipts = () => {

    navigation.navigate('Receipts', {});
  }

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await get(routeConfig.products, user.token);
      if (res && res.status_code == 200) {
        const items = res.data;
        setProducts(items);
        if (items.length > 0)
          setItems([{ product_id: items[0].product_id, title: "", packs: 1 }]);
      } else {
        setItems([]);
      }
      setLoading(false);

    } catch (e) {
      setLoading(false);

    }
  }



  useEffect(() => {
    loadData();
  }, []);


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

  const addItem = () => {
    setItems([...items, { ...products[0], packs: 1 }]);
    if (products.length > 0)
      setItems([...items, { product_id: products[0].product_id, title: "", packs: 1 }]);

  }


  const removeID = () => {
    setImageSource(undefined);
  };

  const submit = async () => {

    try {
      setLoading(true)
      if (items.length < 0) {
        setLoading(false)
        Dialog.show({
          type: ALERT_TYPE.DANGER,
          title: 'WARNING',
          textBody:
            'Please add the products of your receipt.',
          button: 'close',
        });
        return;
      }
      if (!imageSource) {
        setLoading(false)
        Dialog.show({
          type: ALERT_TYPE.DANGER,
          title: 'WARNING',
          textBody:
            'Please upload your the receipt.',
          button: 'close',
        });
        return;
      }
      if (!date) {
        setLoading(false)
        Dialog.show({
          type: ALERT_TYPE.DANGER,
          title: 'WARNING',
          textBody:
            'Please select the date of the receipt.',
          button: 'close',
        });
        return;
      }

      const formData = new FormData();
      formData.append('receipt_date', date.toISOString().split('T')[0].replace(/\//g, '-'));
      formData.append('products', JSON.stringify(items));
      formData.append('receipt', {
        uri: imageSource,
        type: 'image/jpeg', // Adapt file type if needed
        name: 'my_image.jpg', // Optional filename
      })

      const res = await multipart(routeConfig.sales, formData, user.token)
      if (res && res.status_code == 200) {
        setItems([]);
        setDate(new Date())
        setImageSource(undefined);
        // Dialog.show({
        //   type: ALERT_TYPE.SUCCESS,
        //   title: 'success',
        //   textBody:
        //     'Your submission receipt has been successfully processed and is now under review',
        //   button: 'close',
        // });
        setPopup(true)
      } else {
        Dialog.show({
          type: ALERT_TYPE.DANGER,
          title: 'WARNING',
          textBody:
            'It appears that an issue has occurred. Please review your details and try again.',
          button: 'close',
        });
      }
      setLoading(false)
    } catch (e) {
      Dialog.show({
        type: ALERT_TYPE.DANGER,
        title: 'WARNING',
        textBody:
          'It appears that an issue has occurred. Please review your details and try again.',
        button: 'close',
      });
      setLoading(false)
      console.log(e)

    }
  }




  return (
    <>
      <Layout appbar bottomBar navigation={navigation} refresh={loadData}>
        <SafeAreaProvider>

          <View style={Styles.space3}>
            <View style={[Styles.center]}>
              <ImageBackground
                resizeMode="cover"
                source={require("@assets/images/sales.png")}
                style={[Styles.slide, Styles.topCenterRow, { height: scaledHeight * .22 }]}
              >
                <View style={[Styles.space5]}>
                  <Text style={[Styles.boldText, { fontSize: scaledFontSize(28) }]}>Sales of the day!</Text>
                </View>
              </ImageBackground>
              <View style={[{ width: scaledWidth }, Styles.space5]}>
                <View style={[Styles.flexRowEnd,]}>
                  <Button
                    style={[Styles.WhiteButton,]}
                    compact
                    onPress={allReceipts}>
                    <Text style={{ ...Styles.btnText, color: Colors.primary, textAlign: 'center', fontSize: scaledFontSize(12) }}>All Receipts</Text>
                  </Button>
                </View>
                <View style={[Styles.space]}>
                  <ID title='Upload The receipt' imageSource={imageSource} removeID={removeID} uploadID={uploadID} />

                  <View style={[Styles.flexColumn, Styles.space5]}>
                    <Picker placeholder='Date of receipt' date={date} setDate={setDate} />
                    {items.map((item, key) => {
                      return <ProductPicker id={key + 1} key={key} product={item} products={products} items={items} setItems={setItems} />
                    })}
                    <View style={[Styles.flexRowEnd]}>
                      <Button icon={"plus"} style={Styles.WhiteButton} onPress={addItem}>Add product</Button>
                    </View>
                    <View style={[Styles.center, Styles.space3]}>
                      {loading ? <ActivityIndicator size={"large"} color={Colors.white} /> :
                        <Button style={[Styles.fixedButton]} compact onPress={submit} >
                          <Text style={{ ...Styles.btnText, textAlign: 'center', fontSize: scaledFontSize(17) }}>Submit</Text>

                        </Button>
                      }
                    </View>

                  </View>
                </View>
              </View>
            </View>
          </View>



        </SafeAreaProvider>
      </Layout >
      {popup ? <View style={[{ backgroundColor: Colors.placeholder, position: 'absolute', justifyContent: 'center', alignItems: 'center', height: scaledHeight, left: 0, right: 0, top: 0, bottom: 0, borderWidth: 1 },]}>
        <View style={[]}>

          <ImageBackground
            source={require('@assets/images/quiz_bg.png')}
            resizeMode="stretch"
            style={[
              {
                justifyContent: 'center',
                alignItems: 'center',
                position: 'relative',
                // width: width * 0.8,
                width: scaledWidth * .8,
                maxWidth: 700,
                marginHorizontal: scaledFontSize(16),
                height: scaledHeight * 0.5,
                padding: 0.15,
              },
            ]}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                setPopup(false)
              }}
              style={{ position: 'absolute', top: 0, right: 0, zIndex: 10 }}>
              <Image
                source={require('@assets/images/close.png')}
                style={{ width: scaledFontSize(50), height: scaledFontSize(50) }}
              />
            </TouchableOpacity>

            <View style={{ position: 'relative' }}>
              <View
                style={[
                  Styles.quiz,
                  {
                    paddingVertical: 60,
                    gap: scaledFontSize(20)
                  },
                ]}>
                <Text
                  style={[
                    Styles.quizTitle,
                    { fontSize: scaledFontSize(18), fontWeight: "500", textAlign: 'center' },
                  ]}>
                  Thank you for submitting the receipt, it is under review with the Parkology team.
                </Text>
                <View>
                  <CustomButton
                    style={[Styles.submit, { backgroundColor: Colors.white, fontSize: scaledFontSize(25), width: 160, borderRadius: 5 }]}
                    loading={false}
                    title={"New receipt"}
                    type={"contained"}

                    action={() => { setPopup(false) }}
                    color={Colors.primary}
                  />
                  <CustomButton
                    style={[Styles.submit, { backgroundColor: Colors.white, fontSize: scaledFontSize(25), width: 160, borderRadius: 5 }]}
                    loading={false}
                    title={"All receipts"}
                    type={"contained"}

                    action={() => { navigation.replace("Receipts") }}
                    color={Colors.primary}
                  />
                </View>
              </View>
            </View>
          </ImageBackground>
        </View>

      </View> : null}
    </>
  );
}

export default SalesScreen;
