import { CircleButton } from "@components/buttons/Button";
import EventMarkerContainer from "@components/Maker";
import MapDetailModal from "@components/modals/map/MapDetailModal";
import { Box, Container } from "@styles/Common";
import { useQuery } from "@tanstack/react-query";
import customApi from "@utils/client/customApi";
import { useEffect, useRef, useState } from "react";
import { CustomOverlayMap, Map, MapMarker } from "react-kakao-maps-sdk";
import styled from "styled-components";
import MagnifierIcon from "@public/static/icon/magnifier.svg";
import UserIcon from "@public/static/icon/user.svg";

interface ArroundMapProps {
  width: string;
  height: string;
  latitude: number;
  longitude: number;
  department?: string;
}
interface Coords {
  latitude: number;
  longitude: number;
}
export interface AroundMapHospital {
  id: number;
  name: string;
  x: number;
  y: number;
  address: string;
  homepage: string | null;
  medicalDepartments: medicalDepartment[];
  my: boolean;
}
interface medicalDepartment {
  medicalDepartment: { department: string };
}
interface CurrentRangeCoords {
  minLatitude: number;
  maxLatitude: number;
  minLongitude: number;
  maxLongitude: number;
}
type AroundMapHospitalsResponse = AroundMapHospital[];
const ArroundMap = ({ width, height, latitude, longitude, department }: ArroundMapProps) => {
  const [clickIndex, setClickIndex] = useState(-1);
  const [hospitals, setHospitals] = useState<AroundMapHospitalsResponse>();
  const [isInitialFetch, setIsInitialFetch] = useState(true);
  const [coords, setCoords] = useState<Coords>({ latitude, longitude });
  const mapRef = useRef<kakao.maps.Map>();
  const currentRangeCoords = useRef<CurrentRangeCoords>();
  const { getApi: initialGetApi } = customApi(
    `/api/users/my-hospitals/map?latitude=${latitude}&longitude=${longitude}`,
  );
  const { getApi: updateGetApi } = customApi(
    `/api/users/my-hospitals/map?minLatitude=${currentRangeCoords.current?.minLatitude}&minLongitude=${currentRangeCoords.current?.minLongitude}&maxLatitude=${currentRangeCoords.current?.maxLatitude}&maxLongitude=${currentRangeCoords.current?.maxLongitude}`,
  );
  const { isLoading, data, refetch } = useQuery<AroundMapHospitalsResponse>(
    ["hospitalsMap", "map"],
    isInitialFetch ? initialGetApi : updateGetApi,
    {
      onSuccess() {
        setIsInitialFetch(false);
      },
    },
  );

  const filterHospitals = (data: AroundMapHospitalsResponse | undefined) => {
    return data?.filter(
      hospital =>
        hospital.medicalDepartments.filter(
          medicalDepartment => medicalDepartment.medicalDepartment.department === department,
        ).length > 0,
    );
  };

  const handleClickMarker = ({
    index,
    longitude,
    latitude,
  }: {
    index: number;
    longitude: number;
    latitude: number;
  }) => {
    setClickIndex(index);
    setCoords({ latitude: latitude + 0.001, longitude: longitude });
  };

  const handleClickReset = () => {
    const coords = new kakao.maps.LatLng(latitude, longitude);
    mapRef.current?.setCenter(coords);
    mapRef.current?.setLevel(3);
  };

  useEffect(() => {
    if (department === "all") setHospitals(data);
    else setHospitals(filterHospitals(data));
  }, [department, data]);
  return (
    <MapContainer width={width} height={height}>
      <ControlBox>
        <CircleButton nonSubmit size="custom" height="50px" width="50px">
          <MagnifierIcon width={25} height={25} fill="white" />
        </CircleButton>
        <CircleButton nonSubmit size="custom" height="50px" width="50px" onClick={handleClickReset}>
          <UserIcon width={30} height={30} fill="white" />
        </CircleButton>
      </ControlBox>
      {!isLoading && (
        <Map
          center={{
            lat: coords.latitude,
            lng: coords.longitude,
          }}
          isPanto={true}
          style={{
            width,
            height,
          }}
          onCreate={map => (mapRef.current = map)}
          level={3}
          onBoundsChanged={map => {
            currentRangeCoords.current = {
              minLatitude: map.getBounds().getSouthWest().getLat(),
              minLongitude: map.getBounds().getSouthWest().getLng(),
              maxLatitude: map.getBounds().getNorthEast().getLat(),
              maxLongitude: map.getBounds().getNorthEast().getLng(),
            };
          }}
        >
          <MapMarker
            position={{ lat: latitude!, lng: longitude! }}
            image={{
              src: "https://imagedelivery.net/AbuMCvvnFZBtmCKKJV_e6Q/e545a9f3-61fc-49de-df91-a3f5b4e08200/avatar", // 마커이미지의 주소입니다
              size: {
                width: 45,
                height: 45,
              },
              options: {
                offset: {
                  x: 23,
                  y: 0,
                },
              },
            }}
          />

          {hospitals?.map((hospital, index) => (
            <MarkerBox key={index}>
              <EventMarkerContainer hospital={hospital} index={index} handleClickMarker={handleClickMarker} />
              <MapDetailModal clickIndex={clickIndex} setClickIndex={setClickIndex} index={index} hospital={hospital} />
            </MarkerBox>
          ))}
        </Map>
      )}
    </MapContainer>
  );
};
export default ArroundMap;
const MapContainer = styled(Container)<{ width: string; height: string }>`
  width: ${props => (props.width ? props.width : "100%")};
  height: ${props => (props.height ? props.height : "100%")};
  background-color: ${props => props.theme.color.weekPurple};
  border-radius: 20px;
  overflow: hidden;
`;
const ControlBox = styled(Box)`
  position: absolute;
  right: 0px;
  top: 100px;
  right: 30px;
  gap: 20px;
  z-index: 1000;
`;
const HoverBox = styled.div`
  border: 3px ${props => props.theme.color.weekPurple} solid;
  border-radius: 5px;
  background-color: white;
  padding: 5px 10px;
  transform: translateY(-60%);
`;
const ButtonBox = styled.div`
  button {
    margin: 0 auto;
  }
`;

const MarkerBox = styled(Box)`
  position: absolute;
`;
