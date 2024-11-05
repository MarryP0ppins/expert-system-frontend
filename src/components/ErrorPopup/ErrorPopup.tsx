import React from 'react';
import Popup from 'reactjs-popup';
// import Popup from 'reactjs-popup';
import { PopupPosition } from 'reactjs-popup/dist/types';

import ErrorIcon from '@/icons/ErrorIcon';
import { classname } from '@/utils/classname';

import Text from '../Text';

import classes from './ErrorPopup.module.scss';

type ErrorPopupProps = {
  error?: string;
  position?: PopupPosition;
  arrow?: boolean;
  offsetY?: number;
};

const cnPopup = classname(classes, 'errorPopup');

// const ErrorPopup: React.FC<ErrorPopupProps> = ({ error }) => {
//   const id = useId();
//   const ref = useRef<HTMLButtonElement>(null);
//   useEffect(() => {
//     if (ref.current) {
//       ref.current.style.setProperty('--anchor-el', `--anchor-trigger-${id}`);
//     }
//   }, [id]);
//   //style={{ '--anchor-el': `anchor-trigger-${id}` }}
//   return (
//     <div className={cnPopup()}>
//       <button
//         ref={ref}
//         // id={`anchor-trigger-${id}`}
//         popoverTarget={`anchor-popover-${id}`}
//         className={cnPopup('trigger', { visible: !error })}
//         type="button"
//       >
//         <ErrorIcon className={cnPopup('errorIcon')} />
//       </button>

//       <div id={`anchor-popover-${id}`} className={cnPopup('popover')} popover="auto">
//         <Text className={cnPopup('text')}>{error}</Text>
//       </div>
//     </div>
//   );
// };

const ErrorPopup: React.FC<ErrorPopupProps> = ({ error, position = 'top right', arrow = false, offsetY = 4 }) => {
  return (
    <>
      {error && (
        <Popup
          trigger={
            <button className={cnPopup('trigger', { visible: !error })} type="button">
              <ErrorIcon className={cnPopup('errorIcon')} />
            </button>
          }
          on="hover"
          position={position}
          arrow={arrow}
          offsetY={offsetY}
          arrowStyle={{ color: '#d32f2f' }}
        >
          <div className={cnPopup('popover')}>
            <Text className={cnPopup('text')}>{error}</Text>
          </div>
        </Popup>
      )}
    </>
  );
};

 export default ErrorPopup;
