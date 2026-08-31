/*!
* Renders the Update Notice for Mods.
*
* Author:  u/Beach-Brews
* License: BSD-3-Clause
*/

import { useCommentFeed } from '../hooks/CommentFeedContextProvider';
import { linkForThing, openLink } from '../utils/linkUtils';
import { context } from '@devvit/web/client';

export const UpdateNotice = () => {
    const { feedInit } = useCommentFeed();
    const { updateInfo } = feedInit;
    if (!updateInfo) return undefined;
    return (
        <div
            className={`
                text-xs xs:text-base flex justify-between items-center gap-2 px-4 py-2
                  ${updateInfo.urgent 
                      ? 'bg-caution-background text-caution-onbackground'
                      : 'bg-primary-background text-primary-onbackground'
                  }
          `}
        >
            <div>
                Version {updateInfo.latestVersion} now available!
                {updateInfo.message ? <>&nbsp;{updateInfo.message}</> : ''}
            </div>
            <a
                className={updateInfo.urgent ? 'text-caution-onbackground' : 'text-primary-onbackground'}
                href={linkForThing({
                    path: `https://developers.reddit.com/r/${context.subredditName}/apps`,
                })}
                onClick={(e) =>
                    openLink(e, {
                        path: `https://developers.reddit.com/r/${context.subredditName}/apps`,
                    })
                }
            >
                Update
            </a>
        </div>
    );
};
