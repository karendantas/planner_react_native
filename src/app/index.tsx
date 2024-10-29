import { useState } from "react";
import { Input } from "@/components/input";
import { View, Text, Image, Keyboard } from "react-native";

import {MapPin, Calendar as IconCalendar, Icon, Settings2, UserRoundPlus, ArrowRight} from 'lucide-react-native';

import { DateData } from "react-native-calendars";
import {calendarUtils, DatesSelected} from "@/utils/calendarUtils";

import { colors } from "@/styles/colors";
import { Button } from "@/components/button";
import { Modal } from "@/components/modal";

import { Calendar } from "@/components/calendar";
import dayjs from "dayjs";

enum StepForm {
    TRIP_DETAIL = 1,
    ADD_EMAIL = 2,
}

enum MODAL {
    NONE = 0,
    CALENDAR = 1,
    GUESTS = 2
}
export default function Index (){
    //DATA
    const [stepForm, setStepForm] =  useState(StepForm.TRIP_DETAIL);
    const [selectedDates, setSelectedDates] = useState({} as DatesSelected);

    //MODAL
    const [showModal, setShowModal] = useState(MODAL.NONE);

    function handleNextStepForm(){
        if (stepForm === StepForm.TRIP_DETAIL){
            setStepForm(StepForm.ADD_EMAIL)
        }
    }

    function handleOpenCalendarModal(){
        if (stepForm === StepForm.TRIP_DETAIL){
            setShowModal(MODAL.CALENDAR)
        }
    }

    function handleSelectedDates (selectedDay: DateData){
        const dates = calendarUtils.orderStartsAtAndEndsAt({
            startsAt: selectedDates.startsAt,
            endsAt: selectedDates.endsAt,
            selectedDay
        }) 

        setSelectedDates(dates)
    }

    return (
        <View className="flex-1 justify-center items-center px-5">
            <Image 
                source={require("@/assets/logo.png")}
                className="h-8"
                resizeMode="contain"
            />
            <Image 
                source={require("@/assets/bg.png")}
                className="absolute"
            />
            <Text className="text-zinc-400 font-regular text-center text-lg mt-3">
                Convide seus amigos e planeje sua{"\n"}próxima viagem
            </Text> 

            <View className="w-full bg-zinc-900 p-4 rounded-xl my-8 border border-zinc-800">
                <Input>
                    <MapPin color={colors.zinc[400]} size = {20}/>
                    <Input.Field 
                        placeholder="Para onde?" 
                        editable = {stepForm === StepForm.TRIP_DETAIL}
                        
                        />
                </Input>

                <Input>
                    <IconCalendar color={colors.zinc[400]} size = {20}/>
                    <Input.Field 
                        placeholder="Quando?" 
                        editable = {stepForm === StepForm.TRIP_DETAIL}
                        onFocus={ () => Keyboard.dismiss()}
                        showSoftInputOnFocus = {false} //corrige o bug do teclado piscando
                        onPressIn={handleOpenCalendarModal}
                        />
                </Input>

            { stepForm === StepForm.ADD_EMAIL && 
                <>
                    <View className="border-b py-3 border-zinc-800">
                        <Button variant="secondary" onPress={() => {setStepForm(StepForm.TRIP_DETAIL)} }>
                            <Button.title>Alterar local/data </Button.title>
                            <Settings2  color = {colors.zinc[400]} size = {20} />
                        </Button>
                    </View>

                    <Input>
                        <UserRoundPlus color={colors.zinc[400]} size = {20}/>
                        <Input.Field placeholder="Quem estará na viagem?" />
                    </Input>
                </>
                }
                <Button onPress={handleNextStepForm}>
                    <Button.title> 
                        { stepForm === StepForm.TRIP_DETAIL 
                            ? "Continuar" 
                            : "Confirmar viagem" 
                        } 
                    </Button.title>
                    <ArrowRight  color = {colors.lime[950]} size = {20} />
                </Button>
            </View>

            <Text className="text-zinc-500 fon-regular text-center text-base">
                Ao planejar sua viagem pela plann.er você automaticamente concorda
                com nossos{" "}
                <Text className="text-zinc-300 underline"> 
                    termos de uso e políticas de privacidade.
                </Text>
            </Text>

            <Modal 
                title="Selecione datas"
                subtitle="Selecione a data de ida e volta da viagem"
                visible = {showModal  === MODAL.CALENDAR}
                onClose={() => {setShowModal(MODAL.NONE)} }
            >
                <View className="gap-4 mt-4">
                    <Calendar
                        onDayPress={date => handleSelectedDates(date)}
                        markedDates={selectedDates.dates}
                        minDate={dayjs().toISOString()}
                    />
                    <Button onPress={() => setShowModal(MODAL.NONE)}>
                        <Button.title>Confirmar</Button.title>
                    </Button>
                </View>
            </Modal>
        </View>
    )
}