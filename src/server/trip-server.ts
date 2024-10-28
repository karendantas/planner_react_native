//nesse arquivio ficara tudo que for relacionado as viagens durante a conexão com a api
import { api } from './api';

export type TripDetail = {
    id: string,
    destination: string,
    starts_at: string,
    ends_at: string,
    is_confirmed: boolean,
}

//omit é um utilitário do ts pra omitir atributos de tipagens recicladas
type TripCreate = Omit<TripDetail, "id" | "is_confirmed"> & {
    emails_to_invite: string[]
}

async function getById (id: string){
    try{    
        const { data } = await api.get<{trip: TripDetail}>(`/trips/${id}`)
        return data.trip;
    }catch(err){
        throw err;
    }
}

async function create ({destination, starts_at, ends_at, emails_to_invite }: TripCreate){
    try{
        const { data } = await api.post< { tripdId: string } >('/trips', {
            destination,
            starts_at,
            ends_at,
            emails_to_invite,
            owner_name: "Karen",
            owner_email: "karen@example.com"
        })
        return data;
    }catch(err){
        throw err;
    }
}

export const tripServer = { getById, create};