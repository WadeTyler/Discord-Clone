import toast from "react-hot-toast";
import {InviteInfo, Server} from "../types/types.ts";
import {LoadingSpinnerMD} from "./lib/util/LoadingSpinner.tsx";
import {useEffect, useState} from "react";
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";

const Invite = ({inviteLink}: {
  inviteLink: string;
}) => {

  const API_URL = import.meta.env.VITE_API_URL;

  const queryClient = useQueryClient();
  const { data:joinedServers } = useQuery<Server[]>({ queryKey: ['joinedServers'] });

  const inviteID = inviteLink.split("/").pop();
  const [inviteInfo, setInviteInfo] = useState<InviteInfo>();
  const [loadingInviteInfo, setLoadingInviteInfo] = useState<boolean>(false);

  const [isInServer, setIsInServer] = useState<boolean>(false);

  // Fetch invite information request
  const fetchInviteInfo = async () => {
    try {
      setLoadingInviteInfo(true);
      const response = await fetch(`${API_URL}/invites/${inviteID}/info`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include"
      });

      const data = await response.json();
      console.log("Invite Info: ", data);
      if (!response.ok) throw new Error(data.error);

      setInviteInfo(data);
      setLoadingInviteInfo(false);
    } catch (error) {
      setLoadingInviteInfo(false);
      console.log((error as Error).message || "Something went wrong loading invite info.");
    }
  }

  // Fetch invite info if we have inviteID
  useEffect(() => {

    if (inviteID) {
      fetchInviteInfo();
    }

  }, [inviteID]);

  // Check if already in server
  useEffect(() => {
    if (inviteInfo) {
      for (const server in joinedServers) {
        if ((joinedServers[server] as Server).serverID === inviteInfo.serverID) {
          setIsInServer(true);
          return;
        }
      }

      setIsInServer(false);
    }
  }, [inviteInfo]);

  // Mutation to join the server
  const { mutate:joinServer, isPending:joiningServer } = useMutation({
    mutationFn: async () => {
      try {
        const response = await fetch(`${API_URL}/servers/join/${inviteID}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include"
        });

        const data = await response.json();

        if (!response.ok) throw new Error(data.error);

        return data;
      } catch (e) {
        throw new Error((e as Error).message);
      }
    },
    onSuccess: (data: Server) => {
      queryClient.invalidateQueries({ queryKey: ['joinedServers'] });
      queryClient.setQueryData<Server>(['currentServer'], data);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Something went wrong");
    }
  })

  // Navigate to the server if already in
  const navigateToServer = () => {
    if (isInServer && joinedServers && inviteInfo) {
      const server = joinedServers.filter(s => s.serverID === inviteInfo.serverID)[0];
      queryClient.setQueryData<Server | null>(['currentServer'], server);
    }
  }

  if (inviteInfo) return (
    <div className={`w-fit bg-secondary rounded p-4 flex flex-col gap-2`}>
      <p className="input-label">YOU HAVE BEEN INVITED TO JOIN A SERVER</p>
      {/* Info */}
      <div className="flex gap-2 items-center">
        {/* Server Icon */}
        <div
          className="w-12 h-12 flex items-center justify-center relative cursor-pointer rounded-[50%] hover:rounded-[30%] duration-300 bg-primary p-2">
          <img
            src={inviteInfo.serverIcon ? inviteInfo.serverIcon : 'https://cdn.iconscout.com/icon/free/png-256/discord-3-569463.png'}
            alt="Server Icon" className="group-hover:rounded-md rounded-full w-full h-full duration-300"/>
        </div>

        {/* Server Info */}
        <section className="flex flex-col justify-center text-sm">
          <p className="text-white">{inviteInfo.serverName}</p>
          <p className="text-accentDark text-xs">{inviteInfo.serverSize} Users</p>
        </section>
      </div>

      {!inviteInfo.expired && !isInServer && !joiningServer && (
        <button onClick={() => joinServer()} className="submit-btn !bg-green-700 hover:!bg-green-800">Join {inviteInfo.serverName}</button>
      )}
      {joiningServer && (
        <LoadingSpinnerMD />
      )}
      {inviteInfo.expired && !isInServer && (
        <p className="submit-btn text-center">Invite Expired</p>
      )}
      {isInServer && (
        <p onClick={() => navigateToServer()} className="submit-btn text-center">Joined {inviteInfo.serverName}</p>
      )

      }

      
    </div>
  );

  if (loadingInviteInfo) {
    return (
      <LoadingSpinnerMD />
    )
  }

};

export default Invite;