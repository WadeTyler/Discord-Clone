import React, {SetStateAction, useState} from "react";
import CloseButton from "../lib/CloseButton.tsx";
import {useMutation, useQuery} from "@tanstack/react-query";
import {Invite, Server} from "../../types/types.ts";
import toast from "react-hot-toast";
import {LoadingSpinnerMD} from "../lib/util/LoadingSpinner.tsx";


const CreatingInvite = ({setCreatingInvite}: {
    setCreatingInvite: React.Dispatch<SetStateAction<boolean>>;
}) => {

    const API_URL = import.meta.env.VITE_API_URL;

    // Query Data
    const { data: currentServer } = useQuery<Server | null>({ queryKey: ['currentServer'] });

    // States
    const [inviteGenerated, setInviteGenerated] = useState(false);
    const [inviteCode, setInviteCode] = useState('');
    
    // Mutation generateInvite
    const { mutate:generateInvite, isPending:isGeneratingInvite } = useMutation({
        mutationFn: async () => {
            try {

                const inviteRequest = {
                    serverID: currentServer?.serverID
                }

                const response = await fetch(`${API_URL}/invites/create`, {
                    method: 'POST',
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(inviteRequest),
                    credentials: "include"
                });

                const data = await response.json();

                if (!response.ok) throw new Error(data.error);

                return data;
            } catch (e) {
                throw new Error((e as Error).message);
            }
        },
        onSuccess: (data: Invite) => {
            setInviteGenerated(true);
            setInviteCode(data.id);
            toast.success('Invite Generated');
        },
        onError: (error: Error) => {
            toast.error(error.message || "Something went wrong");
        }
    })

    const copyInvite = () => {
        navigator.clipboard.writeText("https://discord.tylerwade.net/invite/" + inviteCode);
        toast.success('Invite Copied');
    }


    return (
        <div className={`bg-[rgba(0,0,0,.8)] fixed w-full h-screen top-0 left-0 flex items-center justify-center z-40`}>
            <div className="relative bg-primary rounded flex flex-col z-50 w-96 p-4 gap-2">
                <CloseButton setState={setCreatingInvite} cn={`top-4 right-4 absolute`}/>

                <p className="input-label mt-4">CREATE INVITE</p>
                {!inviteGenerated && !isGeneratingInvite && (
                    <button
                        onClick={() => generateInvite()}
                        className="submit-btn"
                    >
                        Generate Invite
                    </button>
                )}
                {inviteGenerated && inviteCode && !isGeneratingInvite && (
                    <div className="input-bar flex justify-between items-center">
                        <p className="text-sm">{inviteCode}</p>
                        <button className="submit-btn" onClick={copyInvite}>Copy</button>
                    </div>
                )}
                {isGeneratingInvite && (
                    <LoadingSpinnerMD />
                )}

            </div>
        </div>
    );
};

export default CreatingInvite;