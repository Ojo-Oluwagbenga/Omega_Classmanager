import React, {Component} from "react";
import Comment from "./Comment";
import './cstyle.css'


class CommentReplies extends Component {
    constructor(props) {
      super(props);

    }   
       
  
    render() {
      return (
          <>
              {
                  (Object.keys(this.props.replies).sort()).map((key, i)=>{
                    this.props.replies[key]['parent_address'] = this.props.parent_address
                    return <Comment comment={this.props.replies[key]} key={i} />
                  })
              }
          </>
      );
    }
}

export default CommentReplies;
