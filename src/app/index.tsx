import { useState } from "react";
import { Input } from "@/components/input";
import { View, Text, Image, Keyboard, Alert } from "react-native";

import {MapPin, Calendar as IconCalendar, Icon, Settings2, UserRoundPlus, ArrowRight, AtSign} from 'lucide-react-native';

import { DateData } from "react-native-calendars";
import {calendarUtils, DatesSelected} from "@/utils/calendarUtils";
import { validateInput}  from "@/utils/validateInput";

import { colors } from "@/styles/colors";
import { Button } from "@/components/button";
import { Modal } from "@/components/modal";

import { Calendar } from "@/components/calendar";
import dayjs from "dayjs";
import { GuestEmail } from "@/components/email";
import { tripStorage } from "@/storage/trip";
import { router, useRouter } from "expo-router";
import { tripServer } from "@/server/trip-server";

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
    //LOADING
    const [isCreatingTrip, setIsCreatingTrip] = useState(false);

    //DATA
    const [stepForm, setStepForm] =  useState(StepForm.TRIP_DETAIL);
    const [selectedDates, setSelectedDates] = useState({} as DatesSelected);
    const [destination, setDestination] = useState("");
    const [emailToInvite, setEmailToInvite] = useState("");
    const [guestsEmail, setGuestsEmail] = useState<string[]>([]);

    //MODAL
    const [showModal, setShowModal] = useState(MODAL.NONE);

    function handleNextStepForm(){
        if (destination.trim().length === 0 || !selectedDates.startsAt || !selectedDates.endsAt){
            return Alert.alert("Detalhes da viagem", "Preencha todos os detalhes")
        }

        if (destination.length < 4){
            return Alert.alert("Detalhes da viagem", "Destino deve ter mais que 4 caracteres")
        }

        if (stepForm === StepForm.TRIP_DETAIL){
            return setStepForm(StepForm.ADD_EMAIL)
        }

        //verificando se o usuario quer mesmo cirar a viagem
        Alert.alert("Criar viagem", "Confirmar viagem?", [
            {
                text: "Não",
                style: "cancel"
            },
            {
                text: "Sim",
                onPress: createTrip,
            }
        ])
    }

    function handleOpenCalendarModal(){
        if (stepForm === StepForm.TRIP_DETAIL){
            setShowModal(MODAL.CALENDAR)
        }
    }

    function handleRemoveEmail(emailToRemove: string){
        setGuestsEmail((state) => 
            state.filter( (email) => email !== emailToRemove) 
        )
    }

    function handleAddEmail(){
        if (!validateInput.email(emailToInvite)) {
            return Alert.alert("Convidado", "email inválido")
        }
        const emailAlreadyExists = guestsEmail.find((email) => email === emailToInvite)

        if (emailAlreadyExists){
            return Alert.alert("Convidado", "email já adicionado")
        }

        setGuestsEmail((state) => [...state, emailToInvite])
        setEmailToInvite("")
    }

    function handleSelectedDates (selectedDay: DateData){
        const dates = calendarUtils.orderStartsAtAndEndsAt({
            startsAt: selectedDates.startsAt,
            endsAt: selectedDates.endsAt,
            selectedDay
        }) 

        setSelectedDates(dates)
    }

    //guardando id da viagem e jogando no storage
    async function saveTrip(tripId: string){
        try {
            await tripStorage.save(tripId)
            router.navigate({
                pathname: './trip',
                params: { tripId }
            })
        } catch (error) {
            Alert.alert("Viagem", "falha em salvar o id da viagem")
            console.log(error)
        }
    }


    //criando a viagem
    async function createTrip (){
        try {
            setIsCreatingTrip(true)
            console.log('TESTE')
            const newTrip = await tripServer.create({
                destination,
                starts_at: dayjs(selectedDates.startsAt?.dateString).toString(),
                ends_at: dayjs(selectedDates.endsAt?.dateString).toString(),
                emails_to_invite: guestsEmail,
            })
            console.log('rwsae1')
            Alert.alert("Nova viagem", "Viagem criada com sucesso!", [
                {
                    text: "OK, continuar.",
                    onPress: () => saveTrip(newTrip.tripdId)
                    
                }
            ])
        } catch (error) {
            console.log(error)
            setIsCreatingTrip(false)
        }
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
                        onChangeText={setDestination}
                        value = {destination}
                        
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
                        value = {selectedDates.formatDatesInText}
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
                        <Input.Field 
                            placeholder="Quem estará na viagem?" 
                            autoCorrect = {false}
                            value = {
                                guestsEmail.length > 0 
                                ? `${guestsEmail.length} pessoas convidadas`
                                : ""
                            }
                            onPress={ () => {
                                Keyboard.dismiss()
                                setShowModal(MODAL.GUESTS)
                            }}    
                            showSoftInputOnFocus = {false}
                        />
                    </Input>
                </>
                }
                <Button onPress={handleNextStepForm} isLoading = {isCreatingTrip}>
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

            <Modal
                title = "Selecione convidados"
                subtitle= "Os convidades irão receber emails para confirmar a presença na viagem"
                visible = {showModal === MODAL.GUESTS}
                onClose={()=>{setShowModal(MODAL.NONE)}}
            >
                <View className="my-2 flex-wrap border-b border-zinc-800 py-5 items-start" >
                    {
                       guestsEmail.length > 0 ? 
                        guestsEmail.map( (email) => {
                            return (
                                <GuestEmail
                                    key={email}
                                    email = {email}
                                    onRemove={ () => { handleRemoveEmail(email)} }
                                />
                            )
                        }) :
                        (
                        <Text className="text-zinc-600 text-base font-regular"> 
                            Nenhum email foi adicionado 
                        </Text>
                        )
                        
                    }
               
                </View>
                
                <View className="gap-4 mt-4">
                    <Input variant="secondary">
                        <AtSign color={colors.zinc[400]} size = {20}  />
                        <Input.Field
                            placeholder="Digite o email do convidado"
                            keyboardType="email-address"
                            onChangeText={(text) => setEmailToInvite(text.toLowerCase())}
                            value = {emailToInvite}
                            returnKeyType="send"
                            onSubmitEditing={handleAddEmail}
                        />
                        
                    </Input>

                    <Button onPress={handleAddEmail}>
                        <Button.title>Convidar</Button.title>
                    </Button>
                </View>
             

            </Modal>
        </View>
    )
}