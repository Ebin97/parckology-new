import { scaledFontSize } from '@/components/functions';
import Styles from '@/components/styles';
import { DateType } from '@/components/types';
import { Colors } from '@/constant/color';
import React, { useState } from 'react';
import { TouchableOpacity, View } from 'react-native';
import DatePicker from 'react-native-date-picker';
import { Button, Icon, Text } from 'react-native-paper';
import { DatePickerInput, } from 'react-native-paper-dates';
import { enGB, en, registerTranslation } from 'react-native-paper-dates'
import { SafeAreaProvider } from 'react-native-safe-area-context';
registerTranslation('en-GB', enGB)
registerTranslation('en', en)

function Picker({ placeholder, date, setDate }: DateType) {

    const [open, setOpen] = useState(false);

    return (
        <SafeAreaProvider>
            <View style={{ justifyContent: 'center', flex: 1, alignItems: 'center' }}>
                <TouchableOpacity style={[Styles.dateBox,]} onPress={() => { setOpen(true) }}>
                    <View >
                        <Text style={[Styles.dateText]}>{date ? date.toLocaleDateString() : ""}</Text>
                    </View>
                    <View style={Styles.dateIcon}>
                        <Icon
                            source={'chevron-down'}
                            size={scaledFontSize(45)}
                            color={Colors.primary}
                        />
                    </View>
                </TouchableOpacity>
                <DatePicker modal open={open} date={date} onConfirm={(date) => {
                    setOpen(false);
                    setDate(date);
                }}
                    mode='date'
                    onCancel={() => {
                        setOpen(false);
                    }}
                />

            </View>
        </SafeAreaProvider>
    );
}

export default Picker;