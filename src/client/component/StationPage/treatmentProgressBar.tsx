import * as React from "react";
import {
  Grid,
  Container,
  CircularProgress,
  IconButton,
} from "@material-ui/core";
import SkipNextIcon from "@material-ui/icons/SkipNext";
import { RouteComponentProps, withRouter } from "react-router-dom";
import { changeTreatmentSeatControllerStatus } from "../../api/treatmentSeats";
class TreatmentProgressBar extends React.Component<
  ITreatmentProgressBarProps,
  {}
> {
  constructor(props: ITreatmentProgressBarProps) {
    super(props);
  }

  pauseTimer = async (): Promise<void> => {
    await changeTreatmentSeatControllerStatus(this.props.id, "pause");
  };
  startTimer = async (): Promise<void> => {
    await changeTreatmentSeatControllerStatus(this.props.id, "start");
  };
  skipTimer = async (): Promise<void> => {
    await changeTreatmentSeatControllerStatus(this.props.id, "skip");
  };
  resetTimer = async (): Promise<void> => {
    await changeTreatmentSeatControllerStatus(this.props.id, "reset");
  };

  render(): JSX.Element {
    return (
      <Grid item>
        <Container>
          <div
            style={{ display: "flex", position: "relative" }}
            className="mb-3"
          >
            <CircularProgress
              variant="determinate"
              value={100}
              size={110}
              classes={{ circle: "gray" }}
              style={{ margin: "auto" }}
            />
            <CircularProgress
              variant="determinate"
              value={
                ((this.props.maxTime - this.props.remindTime) /
                  this.props.maxTime) *
                100
              }
              size={110}
              className="absolute-center"
              style={{ transform: "translate(-50%, -50%) rotate(-90deg)" }}
            />
            <div className="absolute-top-right">
              <IconButton
                onClick={this.skipTimer}
                style={{ padding: 0 }}
                disabled={this.props.userName == "沒有人"}
              >
                <SkipNextIcon />
              </IconButton>
            </div>
            <div className="absolute-center">
              <h4 className="text-center orange" style={{ fontSize: 17 }}>
                {this.props.userName}
              </h4>
              <h5
                className={
                  this.props.remindTime / 1000 / 60 < 2
                    ? "text-center red"
                    : "text-center"
                }
                style={{ fontSize: 15, marginBottom: 0 }}
              >
                {this.props.remindTime === this.props.maxTime
                  ? "準備中"
                  : `${
                      this.props.remindTime < 0
                        ? "00:00"
                        : new Date(this.props.remindTime)
                            .getMinutes()
                            .toString()
                            .padStart(2, "0")
                    }:${
                      //秒數補0
                      new Date(this.props.remindTime)
                        .getSeconds()
                        .toString()
                        .padStart(2, "0")
                    }`}
              </h5>
            </div>
          </div>
          <h5 className="text-center">座位</h5>
          <button
            className="btn btn-orange float-left mr-4"
            onClick={this.props.treating ? this.pauseTimer : this.startTimer}
            disabled={this.props.userName == "沒有人"}
          >
            {this.props.treating ? "暫停" : "開始"}
          </button>
          <button
            className="btn btn-orange float-left"
            onClick={this.resetTimer}
            disabled={this.props.userName == "沒有人"}
          >
            重設
          </button>
        </Container>
      </Grid>
    );
  }
}

interface ITreatmentProgressBarProps extends RouteComponentProps {
  userName: string;
  treating: boolean;
  remindTime: number;
  maxTime: number;
  id: number;
}

export default withRouter(TreatmentProgressBar);
